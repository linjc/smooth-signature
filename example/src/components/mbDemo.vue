<template>
  <div class="mbDemo">
    <div class="wrap1" v-show="!showFull">
      <canvas class="canvas1" id="canvas1" />
      <div class="actions">
        <button @click="handleClear1">Clear</button>
        <button @click="handleUndo1">Undo</button>
        <button @click="handlePreview1">View PNG</button>
        <button @click="handleColor1">Change Color</button>
        <button @click="handleFull">Full Screen</button>
      </div>
    </div>
    <div class="wrap2" v-show="showFull">
      <div class="actionsWrap">
        <div class="actions">
          <button @click="handleClear2">Clear</button>
          <button @click="handleUndo2">Undo</button>
          <button @click="handlePreview2">View PNG</button>
          <button @click="handleColor2">Change Color</button>
          <button @click="handleFull">Close Full Screen</button>
        </div>
      </div>
      <canvas class="canvas" id="canvas2" />
    </div>
  </div>
</template>

<script>
import SmoothSignature from "smooth-signature";
export default {
  name: "mbDemo",
  data() {
    return {
      openSmooth1: true,
      openSmooth2: true,
      showFull: true,
    };
  },
  mounted() {
    this.initSignature1();
    this.initSignture2();
  },
  methods: {
    initSignature1() {
      const canvas = document.getElementById("canvas1");
      const options = {
        width: window.innerWidth - 10,
        height: 200,
        minWidth: 2,
        maxWidth: 6,
        // color: "#1890ff",
        bgColor: "#efefef",
      };
      this.signature1 = new SmoothSignature(canvas, options);
    },
    initSignture2() {
      const canvas = document.getElementById("canvas2");
      const options = {
        width: window.innerWidth - 100,
        height: window.innerHeight - 50,
        minWidth: 3,
        maxWidth: 10,
        // color: "#1890ff",
        bgColor: "#efefef",
      };
      this.signature2 = new SmoothSignature(canvas, options);
    },
    handleClear1() {
      this.signature1.clear();
    },
    handleClear2() {
      this.signature2.clear();
    },
    handleUndo1() {
      this.signature1.undo();
    },
    handleUndo2() {
      this.signature2.undo();
    },
    handleFull() {
      this.showFull = !this.showFull;
    },
    handlePreview1() {
      const isEmpty = this.signature1.isEmpty();
      if (isEmpty) {
        alert("isEmpty");
        return;
      }
      const pngUrl = this.signature1.getPNG();
      window.previewImage(pngUrl);
    },
    handlePreview2() {
      const isEmpty = this.signature2.isEmpty();
      if (isEmpty) {
        alert("isEmpty");
        return;
      }
      const canvas = this.signature2.getRotateCanvas(-90);
      const pngUrl = canvas.toDataURL();
      window.previewImage(pngUrl, 90);
    },

    handleColor1() {
      this.signature1.color = this.getRandomColor();
    },
    handleColor2() {
      this.signature2.color = this.getRandomColor();
    },
    getRandomColor() {
      const r = Math.round(Math.random() * 255);
      const g = Math.round(Math.random() * 255);
      const b = Math.round(Math.random() * 255);
      return `rgb(${r}, ${g}, ${b})`;
    },
  },
};
</script>

<style lang="less">
.mbDemo {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  button {
    font-size: 18px;
  }
  canvas {
    border-radius: 10px;
    border: 2px dashed #ccc;
  }
  .wrap1 {
    margin-top: 100px;
    .actions {
      margin-bottom: 20px;
    }
  }
  .wrap2 {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 15px;
    display: flex;
    justify-content: center;
    .actionsWrap {
      width: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .canvas {
      flex: 1;
    }
    .actions {
      margin-right: 10px;
      white-space: nowrap;
      transform: rotate(90deg);
    }
  }
}
</style>