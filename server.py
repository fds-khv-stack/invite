#!/usr/bin/env python
"""Мини-сервер приглашения: отдаёт страницу и пересылает ответ в Telegram.
Токен бота живёт на сервере, в JS его нет.

Запуск:  TG_TOKEN=123:abc TG_CHAT=127419156 python server.py
Порт:    INVITE_PORT (по умолчанию 8770)
"""
import json
import os
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
TG_TOKEN = os.environ.get("TG_TOKEN", "").strip()
TG_CHAT = os.environ.get("TG_CHAT", "").strip()
PORT = int(os.environ.get("INVITE_PORT", "8770"))
LOG = os.path.join(ROOT, "answers.jsonl")


def send_tg(text):
    if not (TG_TOKEN and TG_CHAT):
        return False
    url = "https://api.telegram.org/bot%s/sendMessage" % TG_TOKEN
    data = urllib.parse.urlencode({"chat_id": TG_CHAT, "text": text}).encode()
    try:
        with urllib.request.urlopen(url, data=data, timeout=15) as r:
            return r.status == 200
    except Exception as e:  # noqa: BLE001
        print("[tg] fail:", e, flush=True)
        return False


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

    def do_POST(self):
        if self.path.split("?")[0] not in ("/api/answer", "/answer"):
            self.send_error(404)
            return
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n).decode("utf-8", "replace")
        try:
            p = json.loads(raw or "{}")
        except json.JSONDecodeError:
            p = {"raw": raw}

        text = p.get("text") or (
            "💌 ОТВЕТ НА ПРИГЛАШЕНИЕ\n"
            "Имя: %s\nДень: %s\nВремя: %s\nЗанятие: %s\n«Нет» нажимали: %s раз"
            % (p.get("name", "?"), p.get("date", "?"), p.get("time", "?"),
               p.get("activity", "?"), p.get("noAttempts", 0))
        )
        ok = send_tg(text)
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(dict(p, tg_sent=ok), ensure_ascii=False) + "\n")
        print("[answer]", text.replace("\n", " | "), "->", ok, flush=True)

        body = json.dumps({"ok": True, "tg": ok}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


if __name__ == "__main__":
    if not (TG_TOKEN and TG_CHAT):
        print("! TG_TOKEN/TG_CHAT не заданы — ответы будут только в answers.jsonl")
    print("Приглашение: http://0.0.0.0:%d/" % PORT)
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()

