<template>
  <div class="main-layout">
    <AppHeader />
    <div class="layout-body">
      <AppSidebar class="sidebar" />
      <main class="main-content">
        <slot />
      </main>
    </div>
    <CustomerService
      :link="categoryStore.customerServiceLink"
      icon="/customer-service.png"
    />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import CustomerService from '@/components/common/CustomerService.vue'
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  background-color: #1b1c20;
}

.layout-body {
  display: flex;
  min-height: 100vh;
  margin-top: 0;
}

.sidebar {
  width: 130px;
  flex-shrink: 0;
  background-color: #1b1c20;
  position: sticky;
  top: 0;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px 24px;
  overflow-x: hidden;
  background-color: #1b1c20;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .main-content {
    padding: 6px;
  }
}
</style>
