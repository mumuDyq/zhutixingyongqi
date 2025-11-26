<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
    <div class="ziwei-doushu">
        <h1>紫微斗数{{ count }}</h1>
    </div>
</template>

<style scoped>
.ziwei-doushu {
    background-color: #f0f0f0;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>