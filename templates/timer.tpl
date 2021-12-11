<div class="card"
    id="{% if timer %}{{ timer.id }}{% else %}add-timer-template{% endif %}"
    {% if timer %}{% else %} hidden {% endif %}>
    <div class="row">
        <label>Aktiviert</label>
        <label class="switch">
            <input type="checkbox" class="enabled-input"
                onchange="saveTimer(this.parentNode.parentNode.parentNode)"
                {% if timer %}
                    {% if timer.enabled %}
                        checked
                    {% endif %}
                {% else %}
                    checked
                {% endif %}>
            <span class="slider"></span>
        </label>
    </div>
    <div class="row">
        <label>Zeit</label>
        <input type="time" class="time-input"
            value="{% if timer %}{{ timer.time }}{% else %}00:00{% endif %}">
    </div>
    <div class="row">
        <label>Entität</label>
        <select class="entity-input">
            {% assign entity_list = entities | flatten %}
            {% for entity in entity_list %}
            <option value="{{ entity.id }}"
                {% if entity.id == timer.entity_id %} selected {% endif %}>
                {{ entity.long_name }}
            </option>
            {% endfor %}
        </select>
    </div>
    <div class="row">
        <label>Aktion</label>
        <select class="action-input">
            {% assign action_values = "turn_on,turn_off" | split: ',' %}
            {% for value in action_values %}
            <option value="{{ value }}"
                {% if value == timer.action %} selected {% endif %}>
                {% cycle "Einschalten", "Ausschalten" %}
            </option>
            {% endfor %}
        </select>
    </div>
    <div class="row right">
        <i class="saved-indicator"
            id="{% if timer %}{{ timer.id }}{% else %}add-timer-template{% endif %}-saved">
            Gespeichert</i>
        <img class="icon" src="icons/delete.svg" onclick="removeTimer(this.parentNode.parentNode)">
        <img class="icon" src="icons/save.svg" onclick="saveTimer(this.parentNode.parentNode)">
    </div>
</div>
