<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/format'

// Позиція кошика: показує дані з props, а зміни (+ / − / видалити) віддає батьку подіями
const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['increment', 'decrement', 'remove'])

const lineTotal = computed(() => props.item.price * props.item.qty)
</script>

<template>
  <li class="cart-item">
    <img class="cart-item__image" :src="item.image" :alt="item.name" />

    <div class="cart-item__info">
      <span class="cart-item__name">{{ item.name }}</span>
      <span class="cart-item__price">{{ formatPrice(item.price) }} / шт.</span>
    </div>

    <div class="cart-item__qty">
      <button
        class="qty-btn"
        type="button"
        :disabled="item.qty <= 1"
        aria-label="Зменшити кількість"
        @click="emit('decrement', item.id)"
      >
        −
      </button>
      <span class="cart-item__count">{{ item.qty }}</span>
      <button
        class="qty-btn"
        type="button"
        aria-label="Збільшити кількість"
        @click="emit('increment', item.id)"
      >
        +
      </button>
    </div>

    <span class="cart-item__total">{{ formatPrice(lineTotal) }}</span>

    <button
      class="cart-item__remove"
      type="button"
      aria-label="Видалити з кошика"
      title="Видалити"
      @click="emit('remove', item.id)"
    >
      ✕
    </button>
  </li>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  grid-template-areas:
    'image info remove'
    'image qty total';
  align-items: center;
  gap: 6px 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item__image {
  grid-area: image;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.cart-item__info {
  grid-area: info;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cart-item__name {
  font-weight: 600;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.cart-item__price {
  font-size: 13px;
  color: var(--color-muted);
}

.cart-item__qty {
  grid-area: qty;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-item__count {
  min-width: 20px;
  font-weight: 700;
  text-align: center;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cart-item__total {
  grid-area: total;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}

.cart-item__remove {
  grid-area: remove;
  justify-self: end;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
}

.cart-item__remove:hover {
  background: #fde8e8;
  color: var(--color-danger);
}
</style>
