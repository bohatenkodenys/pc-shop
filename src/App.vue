<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import CartItem from '@/components/CartItem.vue'
import CheckoutForm from '@/components/CheckoutForm.vue'
import { formatPrice } from '@/utils/format'

const CART_KEY = 'zalizo-cart'
const PROMO_KEY = 'zalizo-promo'

/* ---------- Каталог: завантаження через fetch ---------- */

const products = ref([])
const isLoading = ref(true)
const loadError = ref('')

async function loadProducts() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}products.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    // шлях до картинки робимо від кореня сайту, щоб працювало і на GitHub Pages
    products.value = data.map((p) => ({ ...p, image: import.meta.env.BASE_URL + p.image }))
  } catch (error) {
    loadError.value = `Не вдалося завантажити каталог (${error.message})`
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProducts)

/* ---------- Фільтр, пошук, сортування (computed) ---------- */

const search = ref('')
const activeCategory = ref('all')
const sortOrder = ref('default')

const categories = computed(() => [...new Set(products.value.map((p) => p.category))])

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()

  const result = products.value.filter((p) => {
    const matchesCategory = activeCategory.value === 'all' || p.category === activeCategory.value
    const matchesSearch = p.name.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  // sort змінює масив, тому сортуємо копію
  if (sortOrder.value === 'price-asc') return [...result].sort((a, b) => a.price - b.price)
  if (sortOrder.value === 'price-desc') return [...result].sort((a, b) => b.price - a.price)
  return result
})

function resetFilters() {
  search.value = ''
  activeCategory.value = 'all'
  sortOrder.value = 'default'
}

/* ---------- Кошик ---------- */

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// у кошику зберігаємо копію потрібних полів товару + кількість
const cart = ref(loadFromStorage(CART_KEY, []))

// watch з deep: true — спрацьовує і при зміні кількості всередині об'єкта
watch(cart, (value) => localStorage.setItem(CART_KEY, JSON.stringify(value)), { deep: true })

const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const subtotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))

function qtyInCart(id) {
  return cart.value.find((item) => item.id === id)?.qty ?? 0
}

function addToCart(product) {
  const existing = cart.value.find((item) => item.id === product.id)
  if (existing) {
    existing.qty++
  } else {
    const { id, name, price, image } = product
    cart.value.push({ id, name, price, image, qty: 1 })
  }
  orderResult.value = null
}

function increment(id) {
  const item = cart.value.find((i) => i.id === id)
  if (item) item.qty++
}

function decrement(id) {
  const item = cart.value.find((i) => i.id === id)
  if (item && item.qty > 1) item.qty--
}

function removeFromCart(id) {
  cart.value = cart.value.filter((item) => item.id !== id)
}

function clearCart() {
  cart.value = []
  isCheckout.value = false
}

/* ---------- Промокод ---------- */

const PROMO_CODES = {
  STUDENT10: { type: 'percent', value: 10, label: 'Знижка 10%' },
  ZALIZO500: { type: 'fixed', value: 500, minTotal: 5000, label: '−500 ₴ від 5 000 ₴' },
}

const promoInput = ref('')
const promoCode = ref(loadFromStorage(PROMO_KEY, ''))
const promoMessage = ref('')

watch(promoCode, (value) => localStorage.setItem(PROMO_KEY, JSON.stringify(value)))

const promo = computed(() => PROMO_CODES[promoCode.value] ?? null)

const discount = computed(() => {
  if (!promo.value) return 0
  if (promo.value.minTotal && subtotal.value < promo.value.minTotal) return 0
  if (promo.value.type === 'percent') return Math.round((subtotal.value * promo.value.value) / 100)
  return Math.min(promo.value.value, subtotal.value)
})

const promoHint = computed(() => {
  if (promo.value?.minTotal && subtotal.value < promo.value.minTotal) {
    return `Додайте товарів ще на ${formatPrice(promo.value.minTotal - subtotal.value)}, щоб промокод запрацював`
  }
  return ''
})

const total = computed(() => subtotal.value - discount.value)

function applyPromo() {
  const code = promoInput.value.trim().toUpperCase()
  if (!code) return
  if (PROMO_CODES[code]) {
    promoCode.value = code
    promoMessage.value = ''
    promoInput.value = ''
  } else {
    promoMessage.value = 'Такого промокоду не існує'
  }
}

function removePromo() {
  promoCode.value = ''
}

/* ---------- Оформлення замовлення ---------- */

const isCheckout = ref(false)
const orderResult = ref(null)

function placeOrder(order) {
  // реального сервера немає — просто «приймаємо» замовлення і очищаємо кошик
  orderResult.value = {
    number: Math.floor(100000 + Math.random() * 900000),
    name: order.name,
    total: order.total,
  }
  clearCart()
  promoCode.value = ''
}
</script>

<template>
  <AppHeader :cart-count="cartCount" :cart-total="total" />

  <main class="container layout">
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog__head">
        <h1 id="catalog-title" class="catalog__title">Каталог</h1>
        <span v-if="!isLoading && !loadError" class="catalog__count">
          Знайдено: {{ filteredProducts.length }} з {{ products.length }}
        </span>
      </div>

      <div class="toolbar">
        <input
          v-model="search"
          class="input toolbar__search"
          type="search"
          placeholder="Пошук за назвою, напр. Ryzen"
          aria-label="Пошук за назвою"
        />
        <select v-model="sortOrder" class="input toolbar__sort" aria-label="Сортування">
          <option value="default">Без сортування</option>
          <option value="price-asc">Спочатку дешевші</option>
          <option value="price-desc">Спочатку дорожчі</option>
        </select>
      </div>

      <div class="chips" role="group" aria-label="Категорії">
        <button
          class="chip"
          :class="{ 'chip--active': activeCategory === 'all' }"
          type="button"
          @click="activeCategory = 'all'"
        >
          Усі
        </button>
        <button
          v-for="category in categories"
          :key="category"
          class="chip"
          :class="{ 'chip--active': activeCategory === category }"
          type="button"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <p v-if="isLoading" class="message">Завантаження каталогу…</p>

      <div v-else-if="loadError" class="message message--error">
        <p>{{ loadError }}</p>
        <button class="btn btn--primary" type="button" @click="loadProducts">Спробувати ще раз</button>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="message">
        <p class="message__icon">🔍</p>
        <p class="message__title">Нічого не знайдено</p>
        <p>Спробуйте змінити запит або обрати іншу категорію.</p>
        <button class="btn btn--ghost" type="button" @click="resetFilters">Скинути фільтри</button>
      </div>

      <div v-else class="grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :in-cart="qtyInCart(product.id)"
          @add="addToCart"
        />
      </div>
    </section>

    <aside id="cart" class="cart" aria-labelledby="cart-title">
      <div class="cart__head">
        <h2 id="cart-title" class="cart__title">Кошик</h2>
        <button v-if="cart.length" class="link-btn" type="button" @click="clearCart">Очистити</button>
      </div>

      <div v-if="orderResult" class="success">
        <p class="success__icon">✅</p>
        <p class="success__title">Дякуємо, {{ orderResult.name }}!</p>
        <p>
          Замовлення <strong>№ {{ orderResult.number }}</strong> на суму
          <strong>{{ formatPrice(orderResult.total) }}</strong> прийнято. Менеджер зв'яжеться з вами.
        </p>
        <button class="btn btn--ghost" type="button" @click="orderResult = null">Добре</button>
      </div>

      <div v-else-if="cart.length === 0" class="message message--compact">
        <p class="message__icon">🛒</p>
        <p class="message__title">Кошик порожній</p>
        <p>Додайте товари з каталогу — вони з'являться тут.</p>
      </div>

      <template v-else>
        <ul class="cart__list">
          <CartItem
            v-for="item in cart"
            :key="item.id"
            :item="item"
            @increment="increment"
            @decrement="decrement"
            @remove="removeFromCart"
          />
        </ul>

        <div class="promo">
          <div v-if="promo" class="promo__applied">
            <span>
              Промокод <strong>{{ promoCode }}</strong> · {{ promo.label }}
            </span>
            <button class="link-btn" type="button" @click="removePromo">Скасувати</button>
          </div>
          <form v-else class="promo__form" @submit.prevent="applyPromo">
            <input
              v-model="promoInput"
              class="input"
              type="text"
              placeholder="Промокод"
              aria-label="Промокод"
              @input="promoMessage = ''"
            />
            <button class="btn btn--ghost" type="submit">Застосувати</button>
          </form>
          <p v-if="promoMessage" class="promo__error">{{ promoMessage }}</p>
          <p v-if="promoHint" class="promo__hint">{{ promoHint }}</p>
        </div>

        <dl class="summary">
          <div class="summary__row">
            <dt>Товарів</dt>
            <dd>{{ cartCount }} шт.</dd>
          </div>
          <div class="summary__row">
            <dt>Сума</dt>
            <dd>{{ formatPrice(subtotal) }}</dd>
          </div>
          <div v-if="discount > 0" class="summary__row summary__row--discount">
            <dt>Знижка</dt>
            <dd>−{{ formatPrice(discount) }}</dd>
          </div>
          <div class="summary__row summary__row--total">
            <dt>До сплати</dt>
            <dd>{{ formatPrice(total) }}</dd>
          </div>
        </dl>

        <CheckoutForm
          v-if="isCheckout"
          :total="total"
          @submit="placeOrder"
          @cancel="isCheckout = false"
        />
        <button v-else class="btn btn--primary btn--block" type="button" @click="isCheckout = true">
          Оформити замовлення
        </button>
      </template>
    </aside>
  </main>

  <footer class="footer container">
    Навчальний проєкт · Vue 3 + Vite · Промокоди для перевірки: STUDENT10, ZALIZO500
  </footer>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding-block: 24px;
}

@media (min-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }

  .cart {
    position: sticky;
    top: 84px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
}

/* --- каталог --- */

.catalog__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.catalog__title {
  margin: 0;
  font-size: 28px;
}

.catalog__count {
  font-size: 14px;
  color: var(--color-muted);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar__search {
  flex: 1 1 220px;
}

.toolbar__sort {
  flex: 0 1 200px;
}

@media (max-width: 480px) {
  .toolbar__sort {
    flex-basis: 100%;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 20px;
}

.chip {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.chip:hover {
  border-color: var(--color-accent);
}

.chip--active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* --- повідомлення --- */

.message {
  padding: 40px 20px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-muted);
  text-align: center;
}

.message p {
  margin: 0 0 8px;
}

.message--compact {
  padding: 28px 16px;
}

.message--error {
  color: var(--color-danger);
}

.message__icon {
  font-size: 36px;
}

.message__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

/* --- кошик --- */

.cart {
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  scroll-margin-top: 80px;
}

.cart__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cart__title {
  margin: 0;
  font-size: 22px;
}

.cart__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.promo {
  margin-top: 14px;
}

.promo__form {
  display: flex;
  gap: 8px;
}

.promo__form .input {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
}

.promo__applied {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #e8f7ee;
  font-size: 14px;
}

.promo__error,
.promo__hint {
  margin: 6px 0 0;
  font-size: 13px;
}

.promo__error {
  color: var(--color-danger);
}

.promo__hint {
  color: var(--color-muted);
}

.summary {
  margin: 16px 0;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 15px;
}

.summary__row dt {
  color: var(--color-muted);
}

.summary__row dd {
  margin: 0;
  font-weight: 600;
}

.summary__row--discount dd {
  color: var(--color-success);
}

.summary__row--total {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 18px;
}

.summary__row--total dt,
.summary__row--total dd {
  font-weight: 800;
  color: var(--color-text);
}

.success {
  padding: 20px 4px;
  text-align: center;
}

.success p {
  margin: 0 0 10px;
}

.success__icon {
  font-size: 36px;
}

.success__title {
  font-size: 18px;
  font-weight: 700;
}

.footer {
  padding-block: 24px;
  font-size: 13px;
  color: var(--color-muted);
  text-align: center;
}
</style>
