<script setup>
import { formatPrice } from '@/utils/format'

// Дані товару приходять через props, а дію «додати» повідомляємо батьку через emit
defineProps({
  product: { type: Object, required: true },
  inCart: { type: Number, default: 0 },
})

const emit = defineEmits(['add'])
</script>

<template>
  <article class="card">
    <img class="card__image" :src="product.image" :alt="product.name" loading="lazy" />

    <div class="card__body">
      <span class="card__category">{{ product.category }}</span>
      <h3 class="card__title">{{ product.name }}</h3>
      <p class="card__description">{{ product.description }}</p>

      <div class="card__footer">
        <span class="card__price">{{ formatPrice(product.price) }}</span>
        <button class="btn btn--primary" type="button" @click="emit('add', product)">
          {{ inCart > 0 ? `У кошику: ${inCart}` : 'До кошика' }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.1);
  transform: translateY(-2px);
}

.card__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 16px;
}

.card__category {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.card__title {
  margin: 0;
  font-size: 17px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.card__description {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
}

.card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
}

.card__price {
  font-size: 19px;
  font-weight: 800;
}
</style>
