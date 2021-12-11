<div class="card">
    <h2>{{ card.title }}</h2>
    {% render 'entity' for card.entities as entity %}
</div>
