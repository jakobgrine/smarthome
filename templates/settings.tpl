<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>Einstellungen</title>
        <link rel="stylesheet" href="style.css">
        <script src="js/settings.js" defer></script>
    </head>
    <body>
        <header>
            <a href="/">
                <img class="icon" src="icons/arrow_back.svg">
            </a>
            <span>Einstellungen</span>
        </header>
        <main id="timer-container">
            {% render 'timer' %}

            {% assign timer_list = timers | flatten %}
            {% render 'timer' for timer_list as timer %}

            <div class="card" id="add-timer-card" onclick="addTimer()">
                <img class="large-icon" src="icons/add.svg">
            </div>
        </main>
        <div id="disconnect-message">Verbindung getrennt. Verbinde erneut…</div>
    </body>
</html>
