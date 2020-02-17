template = '''
<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="docs/foghorn.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js"></script>
</head>

<body>

    <script>
        let md=`%s`;
        let converter = new showdown.Converter();
        document.body.innerHTML=converter.makeHtml(md);
    </script>
</body>

</html>
'''

md = open('README.md').read().replace('`', '\`')

with open('README.html', 'w') as fh:
    fh.write(template % md)
