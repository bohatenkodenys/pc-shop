<script setup>
import { computed, reactive, ref } from 'vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  total: { type: Number, required: true },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '',
  phone: '',
  email: '',
  delivery: 'pickup',
  address: '',
  comment: '',
})

// Помилки показуємо лише для полів, які користувач уже залишив, або після спроби відправки
const touched = reactive({})
const submitted = ref(false)

const deliveryOptions = [
  { value: 'pickup', label: 'Самовивіз з магазину' },
  { value: 'post', label: 'Нова пошта (відділення)' },
  { value: 'courier', label: "Кур'єр за адресою" },
]

const needsAddress = computed(() => form.delivery !== 'pickup')

// Перевірка полів — computed, тому повідомлення оновлюються під час введення
const errors = computed(() => {
  const e = {}
  const name = form.name.trim()
  const phone = form.phone.replace(/[\s()-]/g, '')

  if (!name) e.name = "Вкажіть ім'я"
  else if (name.length < 2) e.name = "Ім'я занадто коротке"
  else if (!/^[\p{L}' -]+$/u.test(name)) e.name = "Ім'я може містити лише літери"

  if (!phone) e.phone = 'Вкажіть телефон'
  else if (!/^(\+?380|0)\d{9}$/.test(phone)) e.phone = 'Формат: +380XXXXXXXXX або 0XXXXXXXXX'

  if (!form.email.trim()) e.email = 'Вкажіть email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Некоректний email'

  if (needsAddress.value && form.address.trim().length < 5) {
    e.address = form.delivery === 'post' ? 'Вкажіть місто та номер відділення' : 'Вкажіть адресу доставки'
  }

  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function showError(field) {
  return (touched[field] || submitted.value) && errors.value[field]
}

function onSubmit() {
  submitted.value = true
  if (!isValid.value) return

  emit('submit', {
    ...form,
    name: form.name.trim(),
    email: form.email.trim(),
    address: needsAddress.value ? form.address.trim() : '',
    total: props.total,
  })
}
</script>

<template>
  <form class="checkout" novalidate @submit.prevent="onSubmit">
    <h3 class="checkout__title">Оформлення замовлення</h3>

    <label class="field">
      <span class="field__label">Ім'я *</span>
      <input
        v-model="form.name"
        class="input"
        :class="{ 'input--error': showError('name') }"
        type="text"
        autocomplete="name"
        placeholder="Олена Петренко"
        @blur="touched.name = true"
      />
      <span v-if="showError('name')" class="field__error">{{ errors.name }}</span>
    </label>

    <label class="field">
      <span class="field__label">Телефон *</span>
      <input
        v-model="form.phone"
        class="input"
        :class="{ 'input--error': showError('phone') }"
        type="tel"
        autocomplete="tel"
        placeholder="+380 67 123 45 67"
        @blur="touched.phone = true"
      />
      <span v-if="showError('phone')" class="field__error">{{ errors.phone }}</span>
    </label>

    <label class="field">
      <span class="field__label">Email *</span>
      <input
        v-model="form.email"
        class="input"
        :class="{ 'input--error': showError('email') }"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        @blur="touched.email = true"
      />
      <span v-if="showError('email')" class="field__error">{{ errors.email }}</span>
    </label>

    <fieldset class="field field--group">
      <legend class="field__label">Доставка</legend>
      <label v-for="option in deliveryOptions" :key="option.value" class="radio">
        <input v-model="form.delivery" type="radio" name="delivery" :value="option.value" />
        {{ option.label }}
      </label>
    </fieldset>

    <label v-if="needsAddress" class="field">
      <span class="field__label">
        {{ form.delivery === 'post' ? 'Місто та відділення *' : 'Адреса *' }}
      </span>
      <input
        v-model="form.address"
        class="input"
        :class="{ 'input--error': showError('address') }"
        type="text"
        :placeholder="form.delivery === 'post' ? 'Київ, відділення № 25' : 'вул. Хрещатик, 1, кв. 10'"
        @blur="touched.address = true"
      />
      <span v-if="showError('address')" class="field__error">{{ errors.address }}</span>
    </label>

    <label class="field">
      <span class="field__label">Коментар</span>
      <textarea v-model="form.comment" class="input" rows="2" placeholder="Необов'язково"></textarea>
    </label>

    <div class="checkout__actions">
      <button class="btn btn--ghost" type="button" @click="emit('cancel')">Назад</button>
      <button class="btn btn--primary" type="submit">
        Підтвердити · {{ formatPrice(total) }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.checkout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--color-border);
}

.checkout__title {
  margin: 0;
  font-size: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field--group {
  margin: 0;
  padding: 0;
  border: none;
  gap: 6px;
}

.field__label {
  padding: 0;
  font-size: 13px;
  font-weight: 600;
}

.field__error {
  font-size: 12px;
  color: var(--color-danger);
}

.radio {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

textarea.input {
  resize: vertical;
  font-family: inherit;
}

.checkout__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.checkout__actions .btn--primary {
  flex: 1;
}
</style>
