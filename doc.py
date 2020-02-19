'''
Converts markdown into HTML and put into the public folder. 
The Python markdown library is not working well, some parts 
are not converted properly. Most likely it's because the markdown 
syntax used in README.md has Github specific conventions which 
is not compatible with the library. To maximize the compatability
a JavaScript library is used. A "fancy" style sheet is thrown in.
'''
template = '''
<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="foghorn.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.4.2/tocbot.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.4.2/tocbot.min.js"></script>
    <style>
    html,
    body {
        max-width: none;
        text-align:left;
    }

    p {
        hyphens:none;
    }
    li p {
        margin:0;
    }

    h1,
    h2,
    h3,
    h4,
    h5 {
        margin-bottom: 5px;
    }

    h2 {
        margin-top:2em;
        border-bottom: solid 3px darkorange;
    }
    h3 {
        margin-top:1em;
    }

    hr {
        margin-top: 0;
    }
    
    :focus{
        outline:none;
        color:darkorange;
    }

    code {
        background-color: darkorange;
        color: white;
        font-family: 'Courier New', Courier, monospace;
        padding: 0 5px;
        font-size: 0.8em;
    }

    .doc {
        max-width: 600px;
        margin: auto;
    }

    .toc {
        width: 300px;
        position: fixed;
        top: 100px;
        left: calc(50%% + 350px);
    }

    .toc .toc-list .toc-list {
        font-size: 0.8em;
    }

    </style>
</head>

<body>
    <div class="doc">
    </div>
    <div class="toc">
    </div>
    <script>
    let md=`%s`;
    let converter = new showdown.Converter();
    document.querySelector('.doc').innerHTML = converter.makeHtml(md);
    tocbot.init({
        tocSelector: '.toc',
        contentSelector: '.doc',
        headingSelector: 'h2, h3, h4',
        collapseDepth: 4,
        hasInnerContainers: false
    });
    </script>
</body>

</html>

'''

md = open('README.md').read().replace('`', '\`')
md = md.replace('firebase/public/docs/', '')

with open('firebase/public/docs/index.html', 'w') as fh:
    fh.write(template % md)
