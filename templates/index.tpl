<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>Zuhause</title>
        <link rel="stylesheet" href="style.css">
        <script src="js/index.js" defer></script>
    </head>
    <body>
        <header>
            <span>Zuhause</span>
            <a href="/settings">
                <img class="icon" src="icons/settings.svg">
            </a>
        </header>
        <main>
            {% render 'card' for cards as card %}
        </main>
        <div id="disconnect-message">Verbindung getrennt. Verbinde erneut…</div>
    </body>
</html>
