#!/usr/bin/env python3
"""
NEXUS Agent — запускается на ПК, создаёт relay-сессию и выполняет команды с телефона.

Установка зависимостей:
    pip install requests pyautogui

Запуск:
    python nexus_agent.py

Работает на Windows, macOS, Linux.
"""

import os
import sys
import time
import json
import platform
import threading
import requests

RELAY_URL = "https://functions.poehali.dev/0df6b14f-c81b-459a-9bbf-6c5ada645260"
POLL_INTERVAL = 0.5  # секунд между опросами


def relay_post(action, data=None):
    payload = {"action": action, **(data or {})}
    r = requests.post(RELAY_URL, json=payload, timeout=10)
    return r.json()


def relay_get(action, params=None):
    p = {"action": action, **(params or {})}
    r = requests.get(RELAY_URL, params=p, timeout=10)
    return r.json()


def get_pc_info():
    return json.dumps({
        "name": platform.node(),
        "os": f"{platform.system()} {platform.release()}",
        "arch": platform.machine(),
    })


def execute_command(cmd_obj):
    """Выполнить одну команду с телефона."""
    try:
        import pyautogui
        pyautogui.FAILSAFE = False

        cmd = cmd_obj.get("cmd")

        if cmd == "mouse_move":
            dx = cmd_obj.get("dx", 0)
            dy = cmd_obj.get("dy", 0)
            pyautogui.moveRel(dx, dy, duration=0)

        elif cmd == "mouse_click":
            button = cmd_obj.get("button", "left")
            pyautogui.click(button=button)

        elif cmd == "scroll":
            direction = cmd_obj.get("direction", "up")
            amount = cmd_obj.get("amount", 3)
            clicks = amount if direction == "up" else -amount
            pyautogui.scroll(clicks)

        elif cmd == "key_press":
            key = cmd_obj.get("key", "")
            key_map = {
                "⌫": "backspace", "↵": "enter", "⇧": "shift",
                "SPACE": "space", "Esc": "escape", "Tab": "tab",
                "Caps": "capslock", "Win": "win",
            }
            key = key_map.get(key, key.lower())
            if key:
                pyautogui.press(key)

        elif cmd == "hotkey":
            key = cmd_obj.get("key", "")
            parts = key.lower().replace("ctrl", "ctrl").replace("alt", "alt").replace("win", "win").split("+")
            if len(parts) >= 2:
                pyautogui.hotkey(*parts)

        elif cmd == "launch_game":
            game = cmd_obj.get("game", "")
            print(f"[NEXUS] Запуск игры: {game}")

    except ImportError:
        print("[NEXUS] Установи pyautogui: pip install pyautogui")
    except Exception as e:
        print(f"[NEXUS] Ошибка команды {cmd_obj}: {e}")


def poll_loop(session_id):
    """Основной цикл — опрашивает сервер и выполняет команды."""
    pc_info = get_pc_info()
    first_poll = True

    while True:
        try:
            params = {"session_id": session_id}
            if first_poll:
                params["pc_info"] = pc_info
                first_poll = False

            data = relay_get("poll", params)

            if data.get("status") == "disconnected":
                print("\n[NEXUS] Телефон отключился. Завершаю сессию.")
                break

            commands = data.get("commands", [])
            for cmd in commands:
                execute_command(cmd)

        except requests.exceptions.RequestException:
            pass
        except KeyboardInterrupt:
            break

        time.sleep(POLL_INTERVAL)


def main():
    print("=" * 50)
    print("  NEXUS AGENT — Remote Control для ПК")
    print("=" * 50)
    print(f"  ПК: {platform.node()} ({platform.system()})")
    print()

    # Проверяем pyautogui
    try:
        import pyautogui
        print("  pyautogui: OK")
    except ImportError:
        print("  [!] Установи зависимости:")
        print("      pip install pyautogui requests")
        sys.exit(1)

    print()
    print("  Создаю сессию...")

    try:
        data = relay_post("create")
    except Exception as e:
        print(f"  [!] Не удалось подключиться к серверу: {e}")
        sys.exit(1)

    session_id = data.get("session_id")
    pin = data.get("pin")

    if not session_id or not pin:
        print(f"  [!] Ошибка: {data}")
        sys.exit(1)

    print()
    print("  ┌─────────────────────────────┐")
    print(f"  │   PIN-КОД:  {pin}          │")
    print("  └─────────────────────────────┘")
    print()
    print("  Введи этот PIN в приложении на телефоне.")
    print("  Приложение работает из любой точки мира!")
    print()
    print("  Ожидаю подключения... (Ctrl+C для выхода)")
    print()

    # Ждём подключения телефона (опрашиваем статус)
    while True:
        try:
            status_data = relay_get("status", {"session_id": session_id})
            if status_data.get("status") == "connected":
                print("  [✓] Телефон подключён! Управление активно.")
                print()
                break
            time.sleep(1)
        except KeyboardInterrupt:
            print("\n  Выход.")
            sys.exit(0)
        except Exception:
            time.sleep(2)

    # Основной цикл команд
    try:
        poll_loop(session_id)
    except KeyboardInterrupt:
        pass

    relay_post("disconnect", {"session_id": session_id})
    print("\n[NEXUS] Сессия завершена.")


if __name__ == "__main__":
    main()
