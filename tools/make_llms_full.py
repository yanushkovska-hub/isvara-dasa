"""Собирает llms-full.txt — полный текст страниц для нейросетей.

Запуск из корня сайта: python3 tools/make_llms_full.py
Берёт текст со страниц книги (RU и EN) и все ответы со страницы /voprosy/.
После правок этих страниц файл нужно пересобрать.
"""
import html
import json
import re
from html.parser import HTMLParser

SKIP_TAGS = {'script', 'style', 'svg', 'template', 'nav', 'header', 'footer', 'form', 'video', 'button'}
SKIP_CLASSES = {'phone', 'kundali', 'halo', 'dock', 'modal', 'skip', 'slots', 'try', 'fan', 'pk-vis', 'zm', 'tab', 'bridge', 'vh', 'btn', 'cta-row', 'pill', 'tg-row'}
BLOCK = {'h1': '# ', 'h2': '## ', 'h3': '### ', 'p': '', 'li': '- ', 'summary': '### ', 'q': '> ', 'blockquote': '> ', 'dt': '**', 'dd': '', 'div': '', 'figcaption': '', 'small': ''}


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.buf, self.stack, self.skip = [], [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ('br', 'img', 'input', 'meta', 'link', 'source', 'i'):
            if tag == 'br':
                self.buf.append(' ')
            return
        cls = set((dict(attrs).get('class') or '').split())
        hidden = tag in SKIP_TAGS or cls & SKIP_CLASSES or 'hidden' in dict(attrs) or dict(attrs).get('aria-hidden') == 'true'
        self.stack.append((tag, bool(hidden)))
        if hidden:
            self.skip += 1
        elif tag in BLOCK:
            self.flush()
        elif tag == 'span' and self.buf and ''.join(self.buf).strip():
            # «заголовок пункта» + пояснение: разделяем тире
            self.buf.append(' — ')

    def handle_endtag(self, tag):
        if tag in ('br', 'img', 'input', 'meta', 'link', 'source', 'i'):
            return
        while self.stack:
            t, hidden = self.stack.pop()
            if hidden:
                self.skip -= 1
            if t == tag:
                break
        if not self.skip and tag in BLOCK:
            self.flush(BLOCK[tag], tag)

    def handle_data(self, data):
        if not self.skip:
            self.buf.append(data)

    def flush(self, prefix='', tag=''):
        text = re.sub(r'\s+', ' ', ''.join(self.buf)).strip()
        self.buf = []
        if not text:
            return
        if tag == 'dt':
            text = '**' + text + '**'
            prefix = ''
        self.out.append(prefix + text)


def page_text(path):
    src = open(path, encoding='utf-8').read()
    main = src[src.index('<main'):src.index('</main>')]
    t = Text()
    t.feed(main)
    t.flush()
    lines, prev = [], None
    for line in t.out:
        if line != prev:
            lines.append(line)
        prev = line
    return '\n\n'.join(lines)


def faq(path):
    src = open(path, encoding='utf-8').read()
    out = []
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        data = json.loads(block)
        for node in data.get('@graph', [data]):
            if node.get('@type') == 'FAQPage':
                for q in node['mainEntity']:
                    out.append('### ' + q['name'] + '\n\n' + html.unescape(q['acceptedAnswer']['text']))
    return '\n\n'.join(out)


head = open('llms.txt', encoding='utf-8').read().split('\n## ')[0].strip()
parts = [
    head,
    'Этот файл — полный текст основных страниц сайта isvaradasa.com для нейросетей и поисковых систем. Краткая справка: https://isvaradasa.com/llms.txt',
    '---\n\n# Страница: Персональная книга по джйотишу\n\nhttps://isvaradasa.com/personal-book/\n\n' + page_text('personal-book/index.html'),
    '---\n\n# Страница: Вопросы о натальной карте, гороскопе и джйотише\n\nhttps://isvaradasa.com/voprosy/\n\n' + faq('voprosy/index.html'),
    '---\n\n# Page: A personal Jyotish book (English)\n\nhttps://isvaradasa.com/en/personal-book/\n\n' + page_text('en/personal-book/index.html'),
]
open('llms-full.txt', 'w', encoding='utf-8').write('\n\n'.join(parts).rstrip() + '\n')
print('llms-full.txt:', sum(len(p) for p in parts), 'characters')
