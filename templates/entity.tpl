<div class="entity">
    <span>{{ entity.name }}</span>

    {% case entity.type %}
        {% when 'gpio_impulse_relay' %}
            <div id="{{ entity.id }}-state" class="binary-sensor {% if states[entity.id] %} checked {% endif %}"></div>
            <img src="icons/power.svg" id="{{ entity.id }}" class="toggle-button" onclick="onToggle(this)">
        {% when 'gpio_binary_sensor' %}
            <div id="{{ entity.id }}-state" class="binary-sensor {% if states[entity.id] %} checked {% endif %}"></div>
        {% when 'tradfri_light' %}
            <div id="{{ entity.id }}-state" class="binary-sensor {% if states[entity.id] %} checked {% endif %}"></div>
            <img src="icons/power.svg" id="{{ entity.id }}" class="toggle-button" onclick="onToggle(this)">
    {% endcase %}
</div>
