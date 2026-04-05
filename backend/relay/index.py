"""
Relay API — регистрация сессий, передача команд между телефоном и агентом на ПК.
Роутинг через параметр action в теле (POST) или query string (GET).
Работает из любой сети — телефон и ПК общаются через облачный посредник.
"""

import os
import json
import time
import random
import string
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    }


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def generate_pin():
    return "".join(random.choices(string.digits, k=6))


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action") or qs.get("action", "")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # CREATE — агент на ПК создаёт сессию и получает PIN
        if action == "create" and method == "POST":
            pin = generate_pin()
            session_id = "".join(random.choices(string.ascii_lowercase + string.digits, k=20))
            cur.execute(
                """
                INSERT INTO relay_sessions (session_id, pin, created_at, last_ping, status, pending_commands, pc_info)
                VALUES (%s, %s, %s, %s, 'waiting', '[]', '{}')
                """,
                (session_id, pin, int(time.time()), int(time.time()))
            )
            conn.commit()
            return resp(200, {"session_id": session_id, "pin": pin})

        # CONNECT — телефон вводит PIN и подключается
        if action == "connect" and method == "POST":
            pin = str(body.get("pin", "")).strip()
            if not pin:
                return resp(400, {"error": "PIN обязателен"})
            cur.execute(
                "SELECT * FROM relay_sessions WHERE pin=%s AND status IN ('waiting','connected') AND created_at > %s",
                (pin, int(time.time()) - 3600)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Сессия не найдена. Проверь PIN или запусти агент заново."})
            cur.execute(
                "UPDATE relay_sessions SET status='connected', last_ping=%s WHERE pin=%s",
                (int(time.time()), pin)
            )
            conn.commit()
            return resp(200, {
                "session_id": row["session_id"],
                "pc_info": json.loads(row["pc_info"]) if row["pc_info"] else {},
                "status": "connected"
            })

        # COMMAND — телефон отправляет команду мыши/клавиатуры
        if action == "command" and method == "POST":
            session_id = body.get("session_id")
            command = body.get("command")
            if not session_id or not command:
                return resp(400, {"error": "session_id и command обязательны"})
            cur.execute(
                "SELECT pending_commands FROM relay_sessions WHERE session_id=%s AND status='connected'",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Сессия не найдена"})
            commands = json.loads(row["pending_commands"]) if row["pending_commands"] else []
            payload = {k: v for k, v in body.items() if k not in ("action", "session_id", "command")}
            commands.append({"cmd": command, "ts": int(time.time() * 1000), **payload})
            commands = commands[-100:]
            cur.execute(
                "UPDATE relay_sessions SET pending_commands=%s, last_ping=%s WHERE session_id=%s",
                (json.dumps(commands), int(time.time()), session_id)
            )
            conn.commit()
            return resp(200, {"ok": True})

        # POLL — агент на ПК забирает накопленные команды
        if action == "poll" and method == "GET":
            session_id = qs.get("session_id")
            if not session_id:
                return resp(400, {"error": "session_id обязателен"})
            pc_info_raw = qs.get("pc_info")
            if pc_info_raw:
                try:
                    cur.execute(
                        "UPDATE relay_sessions SET pc_info=%s, last_ping=%s WHERE session_id=%s",
                        (pc_info_raw, int(time.time()), session_id)
                    )
                    conn.commit()
                except Exception:
                    pass
            cur.execute(
                "SELECT pending_commands, status FROM relay_sessions WHERE session_id=%s",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Сессия не найдена"})
            commands = json.loads(row["pending_commands"]) if row["pending_commands"] else []
            if commands:
                cur.execute(
                    "UPDATE relay_sessions SET pending_commands='[]', last_ping=%s WHERE session_id=%s",
                    (int(time.time()), session_id)
                )
                conn.commit()
            else:
                cur.execute(
                    "UPDATE relay_sessions SET last_ping=%s WHERE session_id=%s",
                    (int(time.time()), session_id)
                )
                conn.commit()
            return resp(200, {"commands": commands, "status": row["status"]})

        # STATUS — телефон проверяет онлайн ли ПК
        if action == "status" and method == "GET":
            session_id = qs.get("session_id")
            if not session_id:
                return resp(400, {"error": "session_id обязателен"})
            cur.execute(
                "SELECT status, pc_info, last_ping FROM relay_sessions WHERE session_id=%s",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Сессия не найдена"})
            pc_online = row["status"] == "connected" and (int(time.time()) - (row["last_ping"] or 0)) < 15
            return resp(200, {
                "status": row["status"],
                "pc_info": json.loads(row["pc_info"]) if row["pc_info"] else {},
                "pc_online": pc_online
            })

        # DISCONNECT
        if action == "disconnect":
            session_id = body.get("session_id") or qs.get("session_id")
            if session_id:
                cur.execute(
                    "UPDATE relay_sessions SET status='disconnected' WHERE session_id=%s",
                    (session_id,)
                )
                conn.commit()
            return resp(200, {"ok": True})

        return resp(400, {"error": f"Неизвестный action: '{action}'"})

    finally:
        cur.close()
        conn.close()