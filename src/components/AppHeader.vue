<script setup>
import { formatPrice } from '@/utils/format'

// Лічильник і сума приходять із App.vue як props, тому оновлюються одразу
defineProps({
  cartCount: { type: Number, required: true },
  cartTotal: { type: Number, required: true },
})
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <a href="#" class="logo">
        <span class="logo__mark">⚙</span>
        <span>
          <span class="logo__name">Залізо</span>
          <span class="logo__tagline">комп'ютерні комплектуючі</span>
        </span>
      </a>

      <a href="#cart" class="cart-link" aria-label="Перейти до кошика">
        <span class="cart-link__icon">🛒</span>
        <span class="cart-link__badge" :class="{ 'cart-link__badge--empty': cartCount === 0 }">
          {{ cartCount }}
        </span>
        <span class="cart-link__total">{{ formatPrice(cartTotal) }}</span>
      </a>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-dark);
  color: #fff;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-block: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  min-width: 0;
}

.logo__mark {
  font-size: 28px;
  color: var(--color-accent);
}

.logo__name {
  display: block;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.logo__tagline {
  display: block;
  font-size: 12px;
  opacity: 0.7;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s;
}

.cart-link:hover {
  background: rgba(255, 255, 255, 0.18);
}

.cart-link__icon {
  font-size: 20px;
}

.cart-link__badge {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 12px;
  background: var(--color-accent);
  font-size: 13px;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
}

.cart-link__badge--empty {
  background: rgba(255, 255, 255, 0.25);
}

.cart-link__total {
  font-weight: 600;
}

@media (max-width: 480px) {
  .logo__tagline,
  .cart-link__total {
    display: none;
  }
}
</style>
