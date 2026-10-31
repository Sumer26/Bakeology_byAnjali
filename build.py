from pathlib import Path
from datetime import date
from html import escape

ROOT = Path(__file__).resolve().parent

PAGES = [
    (
        'index', 'home', 'Home',
        'Cakes with character, made by Anjali.',
        'home', 'home'
    ),
    (
        'cakes', 'cakes', 'The collection',
        'Explore original Bakeology cake designs.',
        'cakes', 'gallery'
    ),
    (
        'flavours', 'flavours', 'Flavours',
        'Explore cream and dry cake flavours and indicative prices.',
        'flavours', 'flavours'
    ),
    (
        'design', 'design', 'Design your cake',
        'Create a cake idea with our live cake customizer.',
        'customizer', 'customizer'
    ),
    (
        'contact', 'contact', 'Enquire',
        'Tell Anjali about your occasion and request a cake quotation.',
        'contact', 'contact'
    )
]


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


for filename, source, title, description, css, js in PAGES:
    navigation = ''

    for page in PAGES:
        current = (
            ' aria-current="page"'
            if page[0] == filename
            else ''
        )

        navigation += (
            f'<a href="{page[0]}.html"{current}>'
            f'{page[2]}</a>'
        )

    values = {
        'navigation': navigation,
        'year': str(date.today().year),
        'title': escape(title),
        'description': escape(description),
        'content': read(f'src/pages/{source}.html'),
        'styles': f'<link rel="stylesheet" href="css/{css}.css">',
        'scripts': f'<script type="module" src="js/{js}.js"></script>',
        'header': read('src/partials/header.html'),
        'footer': read('src/partials/footer.html')
    }

    page = read('src/layout.html')

    for key in [
        'header', 'footer', 'content',
        'styles', 'scripts', 'title',
        'description', 'navigation', 'year'
    ]:
        page = page.replace(
            '{{' + key + '}}',
            values[key]
        )

    (ROOT / f'{filename}.html').write_text(
        page,
        encoding='utf-8'
    )

print('Built five pages.')
print('Preview with: python3 -m http.server 8000')
