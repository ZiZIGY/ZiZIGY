<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    href: string;
    variant?: 'default' | 'primary' | 'secondary' | 'nav';
    underline?: boolean;
    active?: boolean;
    external?: boolean;
    icon?: any; // Компонент иконки
    iconPosition?: 'left' | 'right';
  }>();

  const emit = defineEmits<{
    click: [event: MouseEvent];
  }>();

  // Вычисляем классы для ссылки на основе переданных props
  const linkClasses = computed(() => {
    return [
      'inline-flex items-center transition-colors duration-300 font-medium',
      {
        // Варианты цветов
        'text-gray-200 hover:text-primary-light':
          props.variant === 'nav' || !props.variant,
        'text-primary hover:text-primary-dark': props.variant === 'primary',
        'text-secondary hover:text-secondary-dark':
          props.variant === 'secondary',

        // Активное состояние
        'text-primary-light':
          props.active && (props.variant === 'nav' || !props.variant),

        // Подчеркивание
        underline: props.underline,

        // Расположение иконки
        'flex-row-reverse': props.iconPosition === 'right',
      },
    ];
  });

  // Атрибуты для внешних ссылок
  const externalAttrs = computed(() => {
    if (props.external) {
      return {
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
    return {};
  });

  // Обработчик клика
  const handleClick = (event: MouseEvent) => {
    emit('click', event);
  };
</script>

<template>
  <a
    :href="href"
    :class="linkClasses"
    @click="handleClick"
    v-bind="externalAttrs"
  >
    <component
      v-if="icon"
      :is="icon"
      class="w-5 h-5"
      :class="{
        'mr-1.5': iconPosition !== 'right',
        'ml-1.5': iconPosition === 'right',
      }"
    />
    <span
      class="relative"
      :class="{ 'nav-link': variant === 'nav' }"
    >
      <slot />
    </span>
  </a>
</template>

<style scoped>
  .nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -3px;
    left: 0;
    background-color: #8a2be2; /* Цвет primary */
    transition: width 0.3s ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }
</style>
