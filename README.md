# invite — приглашение на свидание

Своя версия invitik.ru, но без оплаты и регистрации: одна страница, одна девушка, один вопрос.

## Что править
Только `js/config.js`: её имя, вопрос, даты, время, занятия, секретное сообщение, подпись.
Фото/гифка — положи в `img/` и укажи путь в `photo`.

## Куда приходит ответ
- **Сейчас:** письмо на почту через formsubmit.co (`formsubmitEmail` в конфиге).
  Первый раз FormSubmit пришлёт письмо-подтверждение — нажать кнопку, дальше ответы идут сами.
- **Позже (надёжнее):** поднять `server.py` на VPS и вписать его адрес в `answerUrl` —
  тогда ответ придёт прямо в Telegram, а токен бота останется на сервере.

```bash
# на VPS
TG_TOKEN=<токен_бота> TG_CHAT=<chat_id> INVITE_PORT=8770 nohup python3 server.py &
# в js/config.js: answerUrl: 'https://твой-домен/api/answer'
```

## Деплой на GitHub Pages
```bash
git add -A && git commit -m "правки" && git push
# Pages: ветка main, папка / (root) — обновляется через ~1 минуту
```

## Поведение кнопки «Нет»
`noMode: 'runaway'` — убегает (как на invitik). Ещё есть `shrink` (уменьшается),
`split` (размножается), `kiss` (исчезает с 😘).

## Локально
```bash
cd "G:/Мой диск/My_Project/invite"
python server.py
# открыть http://127.0.0.1:8770/
```
Без `server.py` страница тоже работает (просто открой `index.html`),
но ответ тогда никуда не придёт.

## Чтобы ответ приходил в Telegram
1. `@BotFather` → `/newbot` → токен.
2. Напиши боту любое сообщение, открой
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` → возьми `chat.id`.
3. Запусти с переменными:
```bash
TG_TOKEN=123456:AA... TG_CHAT=127419156 INVITE_PORT=8770 python server.py
```
Ответ прилетит сообщением + продублируется в `answers.jsonl`.

## Деплой на VPS
```bash
# на сервере (Ubuntu)
mkdir -p /opt/invite && cd /opt/invite   # залить сюда index.html, css/, js/, server.py
TG_TOKEN=... TG_CHAT=... nohup python3 server.py > invite.log 2>&1 &
# и проксировать nginx'ом на invite.твой-домен.ru
```

## Проверено
Полный прогон в браузере (мобильный вьюпорт 390×844): вступление → «Да» → дата/время →
занятие → финал → конверт → ответ записан в `answers.jsonl`.
