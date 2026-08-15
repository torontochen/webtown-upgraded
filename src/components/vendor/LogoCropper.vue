<template>
  <v-dialog v-model="dialogSpark" persistent :width="(viewportWidth * 8) / 10">
    <v-card>
      <v-container>
        <v-row class="d-flex" justify="space-between">
          <v-col cols="9">
            <!-- <cropper
              v-if="!image"
              class="cropper"
              :src="image"
              :stencilProps="{
                aspectRatio: 16 / 12
              }"
              :stencilComponent="$options.components.CircleStencil"
              @change="onChange"
              ref="original"
            ></cropper> -->

            <cropper
              class="cropper"
              resizeImage="true"
              :src="image"
              
              @change="onChange"
              ref="cropper"
            ></cropper>
            <!-- :stencilProps="{
                aspectRatio: 15 / 10,
              }" -->
             <!-- <v-slider
                  v-model="width"
                  :max="maxWidth"
                  :min="minWidth"
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-n2 ml-n2"
                  open-on-hover
                >
                </v-slider> -->

          </v-col>
          <!-- <v-col cols="1">
             <v-slider
                  v-model="height"
                  :max="maxHeight"
                  :min="minHeight"
                  vertical
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-9 "
                ></v-slider>
          </v-col> -->
          <!-- Preview -->
          <v-col
            cols="3"
            v-if="preview"
            align-self="start"
            class="pl-12 pr-n12 mt-3"
          >
            <v-avatar
              max-height="300"
              max-width="360"
              size="120"
              tile
              class="profile"
            >
              <!-- <v-img
                :src="'data:image/png;base64,' + resident.avatarPic"
                v-if="!avatar"
              ></v-img> -->
              <v-img :src="preview" height="150" width="180" contain></v-img>
            </v-avatar>
          </v-col>
        </v-row>
        <v-row>
          <v-container>
            <!-- <v-form
              v-model="isFormValid"
              lazy-validation
              @submit="$emit('update-avatar', avatar)"
            > -->
            <v-row>
              <v-col cols="8">
                <v-file-input
                  label="Load Image ( jpeg, png, jpg, gif ) only"
                  color="primary"
                  show-size
                  @change="onFilePicked"
                  :error-messages="errMsg"
                ></v-file-input>
              </v-col>
              <v-col cols="4" class="pl-12">
                <v-row class="my-12">
                  <v-btn
                    color="primary lighten-1"
                    class="d-inline-block mr-2 mt-6"
                    :disabled="!isFormValid"
                    @click="saveCropped"
                    text
                    >Crop & Save</v-btn
                  >
                  <v-btn
                    @click="$emit('abort-logo')"
                    color="primary lighten-1"
                    class="d-inline-block mr-6 mt-6 ml-1"
                    outlined
                    >Abort</v-btn
                  >
                </v-row>
              </v-col>
            </v-row>
            <!-- </v-form> -->
          </v-container>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import { Cropper } from "vue-advanced-cropper";
import { mapGetters } from "vuex";

export default {
  components: {
    Cropper,
  },
  props: {
    value: Boolean,
    preLogo: String,
  },
  data() {
    return {
      dialogSpark: null,
      height: 10,
      image:
        "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAOsAAADWCAMAAAAHMIWUAAAAkFBMVEX///8jHyAgHB0AAADl5eX7+/slISJgXV7JycnAv8D39/cTDg8WEBFFQkOqqaobFxg1MjPd3NySkJHw8PB5eHmgnp+3traxsLFPTE0QBwrs7Ozb29svKyzT0tIJAAA+OzxmZGSDgYJwbm+Yl5dVUlPFw8Olo6SLiYpBPj5aWFgrJih3dXVRTk6Bf39paGi7u7pTKCrWAAANLklEQVR4nO2dV4OyOhCGl1BFIBSp0qQKtv//704C7h5dXRtF4HNu9mIV8vimTJJJ5uvrYx9ryXj63SXoy5w0zKh/gJbWqHQXwDI0FY1/d2G6NFpTDvnaFwABoF/udc+ZKC7tKMZCBAIkagPC3A0lj5ocLk15xkqcI0VPDUDbjXRuSrgI1FxYYH4O+qOuHE4Fl6Y4cycKP1X3Ci4U3L2eLrV3F7WZ0VQqoTZ6VdFzdQU5VA/L0aqLFM0WAbih6Lm60GXjwyjVVVJ9Y0HhnqLnuLYc5qY3KnVp5RBHIgMfU/SXujKLcMeirnJQIxFA8Iykv3FXEjd4dWnFzEOxhC9y/uACOdllg67MipGzAfGyor/VLRYZN8zKrEgrNmAaKnqOC2Qrir2hzYgUc7GV2wT9wXVFNEcYjrqUtNnKROugJ7ihyr0bEhsl7UWXaaOJ/o0LQBkU6pu7KkqKghJ0CvqDy8hFzr2r7VJSKDN9gP7PW4r5G7oqKmORp9sb5w8uhJbaq7qOlAC/d9AjLrTn8q4fdelllvjvAv3mnZNB3rETSfOUjhV9J+fRgC2IG66rdWZe83RWsN+r6KlBgZRzrv2lyAqUGRBobWBuW3lKae3Jq1FexjLzoYHWBudwvZopreDyFBcPUNFTA3PByg+K0wxXUzidLfsfR582KBDWyli+jKstZypbvnl4edgAROquTM95BTSNC3cEip4aFBiEyz2zB0hrnqGGQ+2MbhqAgiDuJI56lFXRC3eMoEcDc9R2H63KXNHf5KUTA1D2HmVlmXeXtqEBmft6rNFOgXVG/0OsD04LJsH6L+n6Yf2wjto+rB/Wf5wVwmHOBsC1SIVmrEBeu3Bo01mApnBMIDIXpWrECgSJ59QwYF6Pg2jZ8HYHcJOV6Wjr+e/yNmbFa/7mwpJRdX43L+KErhjGHJ6mUmIXrNi0mRqJLngfLxa0DNid9L320B0rMt6TduyaeUdvhX9jebvR05NFlk5Zqxcgebdyr9uSqCNCFXefm8tzjM5ZkWmclIdiT/JCBCoXC312uWrWB+sXDq+c6YtEht2uxOGl31Lcq3+E7vXEik3jzHwvouJ0wosaqCDIxS6bKX8Vt0dWZLySSrut27686BdkxCg2bq7mI9aL4nbHis3hDHW/BnZb8qKhZT6Xi5WU3lvX7lfXo2lI3lVSCr+PMLxgiBOsI33mPbAb1Rmrcztejna8Q7wPoC287moAaNtugfdlbv28vNe5L2FsV1l6ewNBUzhzZYH5C/IyWFBBRoLe3l7Ew10idc0qkbC0ItW4fQyBdpZpzMo2+WwMPOlaO/P2+SR+eYg3iQtJvWtWk8QTKSJAw3p6O/pTo5ArKfo26pzvT/2RoAICDZHzd1NQnst2OHIX+S99sNYKIP9bDHNDuflEXqO4PCmRvHdQoe0DcWcot4NakF+6t6ppB/51+mIl6ukGIVub+E5MleYspcWaJP8ciwAStGTje9EsXoYcNOZkenXKevHMdlm/eZl1sTNu49JIXtUCPmq9vx+MWqggb4x750PTnF2XvxzvHnU9wYXQuPtMmleyvUzizqp+OIPPhZIgUTnt7jaTMr8yX+6ftfqnf5+14nW4PLBJXyAYBgnql5GhPBR1plx56btY7cdY63LrrEuSJLRWj4e1D5Z1md7Typltsj9nLbXR3mmQ8GBZ0Qi8N5uceKQpIyrJ/OQJg2U1bNQWwXY1eyVEkOY9tWBIHwrqGFhNG3tBtm+7kbl8hpfmqcPGnSNQggFwLKxEPaTYJEzU1HmEl9YcHOJJ4ohA/PJRsVaGRxYYbLDvd9PJ1ZTDTiTIk4DzJ1kvStQ/69Gn98swnv1VnZFPpUeybwuQOHnr+HT9NtR6CTG/upaiSVZp2xdbbeNlxbikeNV3oDbktUnBqFkZaF1nXVw0ttGzEh/WD+uH9QbrxdcnzPov6fph/bB+WD+sH9YPa1+sF1+fMOvEde1ln+5yZj1VXQ8CvNhG6p8V75jZnccQ8GkcBu759mC/rNU+d8Dmh+9t/U5jfihpVwQn2779sVYbvnKxyU7387uOb9JSPcL3U1X69sNaBYLL1j4+/FqQ7CGWq74yD1dn6HfOiuNpy3W4kq5sivUUt+akGarOgOycFcrJQv8t6P+sF1/vJkZPWxrxPu2WlWL/iqc9svYYj+iclqMDVv5m+OVbYi87Y71t72Qlr4YRP8MK4NwfBauihjKOEn+VFQpzwWXvX5lHfxfojaz4epVsYTH2/Az3MVYw9wkxwhdq3y4qvtlkNgDWr/radzUs7RN577MCYe6DJL8TZoq/k+IATDIeButXlbeAy/YBJI+Xhd9hBYIPZVbn7l1LhIY4NRJL5Fp0P895ynhqaeQJqDqrP1mFqisSrN39vAZOqmPXRcCeKdP9usSzhuMu9bCc++QfrBvSt8siTu/E0+Kop8ol/YlXHZiuR+OdpbkQxfTa/6iNHEl383Jos3izlcHZVHKYrF+VvNfP2PDKA/lWnCS4PMo2WNZmplyLqZgs6wXplFjp0+nElFn52cqK37+O2LnRSpZAnyQHsGbarWmHlUVi12MQexydGc0rZujayKUcTJxpJ0bzVBonAmn/nPKYJivNa4oUras5wv+vnSQrjnkHvv07c9IkWZHvfy1D1ERZr54rnCbrgPck27YP6zDiJdq2j64f1reyKofG2ZlGw2qIyUKfvXDz+hhZXRsy+Pao1+UdD6uMZ5pClVrt8Jq8Y2KtCwYhExSLa8EMU2MljkEq7jpUn229o/El/mc9FrDKFJjdvkykC9ZedT3BRfoW+cOtd8Ss1WcBnMNgnz2UJ2LkrPXnbZJ5ZCAackztg6yoLILbJSsUBsRKCHJXrPgeQdeKlhNnrca2cr2PTy4nmSRrFVEbJDvjvNebHGsdObzd6JdXY73Fl+iQVbhx5dnEdCWKnf5nmuppsWrmrTutpsV65xHjZgXQ/jdY8dXK7tZ8eLI0UlYG4IhaOVSfyR84TlY4t0trkaXLp5avxsbKEBDOSZfNDe+ZDIn1I8bjSwi1oDCIslR5ZYFuTLrCuc8kWNAXdxbGwxqR7l5PmySqHQ2rZprLhumlR8P61Txt+HhYm9uHdbKsF8WdMGvbul757jRZCcial+v4Q2DVONW9vEqyWX66Ockkqnc+QryblXbMULbJy/wBDVnRdMv2SXk3o/7nfSMrzWucXvi+P7+WKaF5jkV8zy5JyqHuHa9ufxcrr1HmQpxXUZtXi9pOPkkGCL4NrXyGjxAd3sBaHVpjGfu6oK2yEvXiAWkHke5ll71Ct6z4tNrOgtVhxFtlbDdPKJbXlW99rm3W6pBpKAv+tXjjTlkJ4nqGzo5Yecoz84TwH8yo1Xf+19ZYaWeJTw2DRwQdNSuvcFJeMPblYf+JsWreTI9E4glBx8laC+rCl5KijYmV94w4ssqXcxmOhZWm0mzFylBokOXuCdaijTy2sJw9D0t7pooEFZplLwTAfZSVypKyeaJTAHBut8eSAdXmcPqikEETQav3QibYeA9mAkEeyiEP10KD3IGVQQEExSL7c0P87J1LfMtXKTT8jdFkzE02GecpD2c9oR1qOcsWItH41cdAh9vxehoXbxK58cuQIydHscktlxR1OwPIGSvPaw6leEZeoE6icQnA9QCW2hTjSpKy51+Dw7s2EuctFQqR3s8XdolLKSmSt2FXcQxMYlcX0ae0Fx+z6zUGDVUDcSqYE4E+vcBOo8m/5uDqnCdu086qDqaOJO+nGIqxayFZO+JkxEjiaj2dVzhPeR3Em+qR3CTR6TcvdJOdgUrjxWFweVvo8w+0CRbfglQLyjcA/eZF8moatTys1kTjtL14q9VlA/ynKacA5D0SlKKOLbTxztARt6rOGuow94HQXI2miZ3x6ZGyWBkI8lvQdjh/eFFt1njHO6wslyHacK1e5AREGUQZpzhH0JY5f3BxdXYoJK/oMqB/XgCYEnXo5k/F7Qj0iFu3XsczV0XQKy/mlK0qv/G3oF2CfvMe5Z2p0TYoe8EFoJRFJKjXdk/0GG/VOXPSihXlbuWtGmiy0Q9I0P5B/8flNUqZIW82QN5PJ7gAooq7X0meQjndt9CbuMfWy0l5uJVBy/Kix5VisYiN1sfQl3kxLk95s3hRrFuTF1SCRjl2Ft4s6LnRVW+FxiIp32/lFub5OM03u4uNt3RF963unCnvoO/QHK2BvAAycrJRzdTrYwx91bC8yLlSOFONktfkxbMWdpUdPGWQgp7bj7zZCie4f6azQnXB3S6GLui51fJSCocXed3HZkbImSfW7Eo6eMvG89C+7VveWbXWe0de3BVhQbkRCXpuJ/LuxT/XNerlmVyajVDQczuORR5eyr9Sm/ECirWJDc6rV8S6mp/1ZfXYSyloMIrWzIm8qCuSixz1RHipaMyCnttR3iWX7YoSL0rghWMxilFPtOxvetab0cdFWORKhi4grNzkGixxDt/qVStUnbN0eQSdJOe3VfJW89DR90SPWCXvpAUdgP0HasC1ndWuRtIAAAAASUVORK5CYII=",
      logo: null,
      errMsg: "",
      isFormValid: false,
      maxHeight: 100,
      minHeight: 5,
      maxWidth: 100,
      minWidth: 5,
      preview: null,
      viewportWidth: 0,
      width: 12
    };
  },

  watch: {
    value(val) {
      if (val) {
        this.dialogSpark = true;
      } else {
        this.dialogSpark = false;
      }
    },
  },

  mounted() {
    this.viewportWidth = window.innerWidth;
    this.image = this.preLogo ? this.preLogo : this.image
  },


  methods: {
    onChange({ coordinates, canvas }) {
      this.errMsg = "";
      this.coordinates = coordinates;
      this.isFormValid = true;
      // You able to do different manipulations at a canvas
      // but there we just get a cropped image
      this.preview = canvas.toDataURL();
    },
    saveCropped() {
      if (this.image) {
        const { coordinates, canvas } = this.$refs.cropper.getResult();
        this.logo = canvas.toDataURL();
      } else {
        this.logo = this.preview;
      }

      this.$emit("update-logo", this.logo);
    },
    onFilePicked(File) {
      // console.log(event.name);
      if (File) {
        console.log(File);
        let filename = File.name;
        if (filename.lastIndexOf(".") <= 0) {
          // return alert("Please add a valid file");
          this.errMsg = "Please add a valid file";
          this.isFormValid = true;
        }
        // console.log(File.type === "image/jpeg");

        if (
          File.type === "image/jpeg" ||
          File.type === "image/png" ||
          File.type === "image/jpg" ||
          File.type === "image/gif"
        ) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(File);
          fileReader.addEventListener("load", () => {
            // console.log(fileReader.result);
            this.image = fileReader.result;
          });
          this.isFormValid = true;
        } else {
          // return alert("Please add an image( Jpeg, Png, Jpg, Gif ) file");
          // console.log("done");
          this.errMsg = "Not an image( jpeg, png, jpg, gif ) ";
          this.isFormValid = false;
          this.logo = "";
          this.image = "";
        }
      } else {
        this.errMsg = "No new logo image loaded yet ! ";
        this.logo = "";
        this.image = "";
        this.isFormValid = false;
      }
      // const files = event.target.files;
      // this.isFormValid = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.cropper {
  height: 300px;
  background: #ddd;
}
</style>
