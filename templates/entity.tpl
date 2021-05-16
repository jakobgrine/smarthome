<div class="entity">
    <span>{{ entity.name }}</span>

    {% case entity.type %}
        {% when 'binary_sensor_button' %}
            <!-- TODO: add state -->
            <div id="{{ entity.id }}-state" class="binary-sensor {% if states[entity.id] %} checked {% endif %}"></div>
            <img src="icons/power.svg" id="{{ entity.id }}" class="toggle-button" onclick="onToggle(this)">
        {% when 'binary_sensor' %}
            <!-- TODO: add state -->
            <div id="{{ entity.id }}-state" class="binary-sensor {% if states[entity.id] %} checked {% endif %}"></div>
    {% endcase %}
</div>
