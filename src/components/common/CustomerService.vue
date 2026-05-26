<template>
  <Teleport to="body">
    <div v-if="visible" class="customer-service" :class="{ 'breathing': isBreathing }">
      <button class="close-btn" @click="close">×</button>
      <a
        :href="link"
        target="_blank"
        rel="noopener noreferrer"
        class="service-link"
        @click="handleClick"
      >
        <img :src="icon" alt="客服" />
      </a>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  link: {
    type: String,
    default: 'https://example.com/chat'
  },
  icon: {
    type: String,
    default: '/customer-service.png'
  }
})

const visible = ref(true)
const isBreathing = ref(true)

const close = () => {
  visible.value = false
}

</script>

<style scoped lang="scss">
.customer-service {
  position: fixed;
  right: 30px;
  bottom: 60px;
  z-index: 1000;
  transition: transform 0.3s ease;

 /*  &.breathing {
    animation: breathing 2s ease-in-out infinite;
  } */

  .close-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #666;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: background 0.2s;

    &:hover {
      background: #999;
    }
  }

  .service-link {
    display: block;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

@keyframes breathing {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0);
  }
}

@media (max-width: 768px) {
  .customer-service {
    right: 20px;
    bottom: 50px;
    width: 45px;
    height: 45px;

    .service-link {
      width: 45px;
      height: 45px;
    }
  }
}
</style>
