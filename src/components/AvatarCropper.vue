<template>
  <v-dialog
    v-model="dialogSpark"
    persistent
:width="viewportWidth * 5/10"
    :height="viewportHeight * 0.7"
  >
   
    <v-card class="pa-4 ma-auto">
      <v-card-text>
        <v-row
        >
          <v-col cols="8">
            <cropper
              v-if="!image && resident"
              class="cropper"
              :src="resident.avatarPic"
              :stencilProps="{
                aspectRatio: 16 / 12
              }"
              :stencilComponent="$options.components.CircleStencil"
              @change="onChange"
              ref="original"
            ></cropper>

            <cropper
              v-else
              class="cropper"
              :src="image"
              :stencilProps="{
                aspectRatio: 16 / 12
              }"
              :stencilComponent="$options.components.CircleStencil"
              @change="onChange"
              ref="cropper"
            ></cropper>
          </v-col>
          <!-- Preview -->
          <v-col
            cols="4"
            v-if="preview"
            align-self="start"
            class="pl-12 pr-n12"
          >
            <v-avatar size="180" class="rounded-lg">
              <!-- <v-img
                :src="'data:image/png;base64,' + resident.avatarPic"
                v-if="!avatar"
              ></v-img> -->
              <v-img :src="preview"></v-img>
            </v-avatar>
          </v-col>
        </v-row>
        <v-row>
          <!-- <v-container> -->
            <!-- <v-form
              v-model="isFormValid"
              lazy-validation
              @submit="$emit('update-avatar', avatar)"
            > -->
            <!-- <v-row> -->
              <v-col cols="8">
                <v-file-input
                  label="Load Image ( jpeg, png, jpg, gif ) only"
                  color="primary"
                  show-size
                  @change="onFilePicked"
                  :error-messages="errMsg"
                ></v-file-input>
              </v-col>
             
            <!-- </v-row> -->
            <!-- </v-form> -->
          <!-- </v-container> -->
        </v-row>
        
      </v-card-text>
      <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" size="small" 
                    color="primary lighten-1"
                    class="d-inline-block mr-2 mt-6"
                    :disabled="!isFormValid"
                    @click="saveCropped"
                  >Crop & Save</v-btn>
                  <v-btn variant="text"
                    @click="$emit('abort-avatar')"
                    color="primary lighten-1"
                    class="d-inline-block mr-6 mt-6 ml-1" size="small" 
                  >Abort</v-btn>
               
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import { mapGetters } from "vuex";

export default {
  components: {
    Cropper,
    CircleStencil
  },
  props: {
    value: Boolean,
    resident: {}
  },
  data() {
    return {
      dialogSpark: null,
      coordinates: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      image: null,
      avatar: null,
      errMsg: "",
      isFormValid: false,
      preview: null,
      viewportWidth: 0,
      viewportHeight: 0
    };
  },

  watch: {
    value(val) {
      if (val) {
        this.dialogSpark = true;
      } else {
        this.dialogSpark = false;
      }
    }
  },
  computed: {
    // ...mapGetters(["resident"])
  },
  mounted() {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight
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
        this.avatar = canvas.toDataURL();
      } else {
        this.avatar = this.preview;
      }

      this.$store.dispatch("updateAvatar", {
        email: this.resident.email,
        avatarUpdated: this.avatar
      });
      this.$emit("update-avatar");
    },
    onFilePicked(File) {
      // console.log(event.name);
      if (File) {
        // console.log(File);
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
            // this.original = false;
          });
          this.isFormValid = true;
        } else {
          // return alert("Please add an image( Jpeg, Png, Jpg, Gif ) file");
          // console.log("done");
          this.errMsg = "Not an image( jpeg, png, jpg, gif ) ";
          this.isFormValid = false;
          this.avatar = "";
          this.image = "";
        }
      } else {
        this.errMsg = "No new avatar image loaded yet ! ";
        this.avatar = "";
        this.image = "";
        this.isFormValid = false;
      }
      // const files = event.target.files;
      // this.isFormValid = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.cropper {
  height: 300px;
  background: #ddd;
}
</style>
