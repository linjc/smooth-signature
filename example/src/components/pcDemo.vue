<template>
  <div class="pcDemo">
    <div class="actions">
      <button @click="handleClear">Clear</button>
      <button @click="handleUndo">Undo</button>
      <button @click="handlePreview">View PNG</button>
      <button @click="handleColor">Change Color</button>
    </div>
    <div class="tip">使用手机端手写更方便</div>
    <canvas />
  </div>
</template>

<script>
import SmoothSignature from "smooth-signature";
export default {
  name: "pcDemo",
  data() {
    return {
      openSmooth: true,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const canvas = document.querySelector("canvas");
      const options = {
        width: Math.min(window.innerWidth, 1000),
        height: 600,
        minWidth: 4,
        maxWidth: 12,
        // color: '#1890ff',
        bgColor: '#e9cb93'
      };
      this.signature = new SmoothSignature(canvas, options);
    },
    handleClear() {
      this.signature.clear();
    },
    handleUndo() {
      this.signature.undo();
    },
    handleColor() {
      this.signature.color = '#' + Math.random().toString(16).slice(-6);
    },
    handlePreview() {
      const isEmpty = this.signature.isEmpty();
      if (isEmpty) {
        alert('isEmpty')
        return;
      }
      const pngUrl = this.signature.getPNG();
      window.previewImage(pngUrl);
    }
  },
};
</script>

<style lang="less">
.pcDemo {
  button {
    margin-right: 10px;
    font-size: 18px;
  }
  canvas {
    border: 2px dashed #ccc;
    cursor: crosshair;
  }
  .actions {
    margin: 30px 0;
  }
  .tip {
    color: #108eff;
  }
}
</style>