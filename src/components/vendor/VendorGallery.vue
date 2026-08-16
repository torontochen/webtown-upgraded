<template>
  <v-container fluid>
   
      <v-card flat class="p-2 shade">
         <v-btn
          color="primary"
          theme="dark" icon 
          top 
          right
          absolute
          @click="addImgWindowOpen=true"
          class="mt-4"
        >
          <v-icon theme="dark"> mdi-plus </v-icon>
        </v-btn>
      <v-card-title class="text-primary"
        >Gallery</v-card-title
      >
      
      <v-row>
        <v-col
          v-for="(photo, i) in businessPhotos"
          :key="i"
          class="d-flex child-flex"
          cols="4"
        >
        <v-hover>
          <template v-slot:default="{ hover }">
            <v-img
            :src="photo"
            :lazy-src="photo"
            aspect-ratio="1"
            class="grey lighten-2"
          >
           <!-- :src="`/${vendor.businessTitle}/${photo}`"
            :lazy-src="`/${vendor.businessTitle}/${photo}`" -->
            <!-- <template v-slot:placeholder> -->
              <!-- <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey lighten-5"
                ></v-progress-circular>
              </v-row> -->
            <!-- </template> -->
              <v-fade-transition>
                <v-overlay
                  v-if="hover"
                  absolute
                  color="#036358"
                  class="d-flex justify-center align-center"
                >
                <v-row>
                   <v-icon
                   large
                  color="white"
                  class="mx-3"
                  @click="showSinglePhoto(photo)">mdi-selection-search</v-icon>
                   <v-icon
                   large
                  color="white"
                  class="mx-3"
                  @click="updateGalleryPhotos(i)">mdi-trash-can</v-icon>
                </v-row>
                </v-overlay>
              </v-fade-transition>
              </v-img>
            </template>
          </v-hover>
        </v-col>
      </v-row>
      
      </v-card>
     
   
   <!-- add gallery photos -->
    <v-dialog v-model="addImgWindowOpen" width="700" persistent transition="fade">
      <v-card class="pa-2">
        <v-card-title class="headline" style="color: #ff9800"
          >Add Business Photos</v-card-title
        >

        <v-card-text style="color: #ff9800" class="body-1">
          <!-- file input to add photo files -->
                    <v-row>
                        <v-col cols="12">
                          <v-file-input
                            label="Load business photos ( jpeg, png, jpg, gif ) only, Not more than 10MB"
                            color="primary"
                            show-size
                            chips
                            small-chips
                            multiple
                            counter density="compact"
                            @change="onFilePicked"
                            :error-messages="errMsgPic"
                            v-model="photoFiles"
                          ></v-file-input>
                        </v-col>
                      </v-row>

        <!-- show photos added -->
                      <v-row>
                        <v-col cols="12">
                           <!-- <v-alert
                              density="compact"
                              outlined
                              type="error"
                              v-if="businessPhotosToShow.length == 0"
                              class="d-block mt-3"
                            >
                              At least one business photo is needed
                            </v-alert> -->
                          <v-slide-group show-arrows>
                            <v-slide-item
                              v-for="(photoToShow, index) in photosUpload"
                              :key="index"
                              v-slot:default="{ toggle }"
                            >
                              <v-card
                                class="ma-4"
                                @click="toggle"
                                height="150"
                                width="150"
                                flat
                              >
                                <v-row
                                  class="fill-height"
                                  align="center"
                                  justify="center"
                                >
                                  <v-col cols="12">
                                    <v-icon
                                      @click="deleteBuzPhoto(index)"
                                      color="primary lighten-1"
                                      class="d-block mb-2"
                                    >
                                      mdi-close-circle-outline
                                    </v-icon>
                                    <v-img
                                      :src="photoToShow"
                                      height="150"
                                      width="150"
                                    >
                                    </v-img>
                                  </v-col>
                                </v-row>
                              </v-card>
                            </v-slide-item>
                          </v-slide-group>
                        </v-col>
                      </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="accent"  @click="handleCancel"> Cancel </v-btn>

          <v-btn variant="text" color="accent"  @click="updateGalleryPhotos"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<!-- show single photo -->
    <v-dialog v-model="singlePhotoPageOpen" width="700"  transition="fade">
      <v-card class="pa-8">
        <!-- <v-card-text> -->
          <v-img
             :src="singlePhotoPageUri"
            :lazy-src="singlePhotoPageUri"
            aspect-ratio="1">
          </v-img>
        <!-- </v-card-text> -->
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { UPDATE_GALLERY_FILES } from "../../queries/queries_mutation"
// import {GET_CURRENT_VENDOR} from "../../queries/queries_query"

export default {
  name: "Gallery",
  data() {
    return {
      addImgWindowOpen: false,
      businessPhotos: [],
      errMsgPic: '',
      photoFiles: [],
      photosUpload: [],
      singlePhotoPageUri: '',
      singlePhotoPageOpen: false
    };
  },
  mounted() {
    window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      event.returnValue = "ok";
    });

    this.businessPhotos =[...this.vendor.photoList] 
    // console.log(this.businessPhotos)
    // const { businessCategory } = this.vendor;
  
  },
  watch: {
   
  },
  computed: {
    ...mapGetters(["vendor"]),
    
   
  },
  methods: {
    deleteBuzPhoto(index) {
      this.errMsgPic = "";
      this.photosUpload.splice(index, 1)
      // this.businessPhotosToShow.splice(index, 1);
      // console.log(this.businessPhotosToShow);
      // const indexOfUpload = _.findIndex(this.photosUpload, (item) => {
      //   return item.name == this.photoList[index];
      // });
      // console.log(indexOfUpload);
      // if (indexOfUpload > -1) {
      //   this.photosUpload.splice(indexOfUpload, 1);
      //   console.log(this.photosUpload);
      // }

      // this.photoList.splice(index, 1);
      // console.log(this.photoList);
    },

    handleCancel() {
      this.businessPhotosToShow =  []
      this.errMsgPic =  ''
      this.photoFiles = []
      this.photosUpload = []
      // this.photoList = []
      this.addImgWindowOpen = false
    },

    onFilePicked(File) {
      this.errMsgPic = "";
      if (File) {
        // console.log(File);
        File.map((file, index) => {
          let filename = file.name;
          if (filename.lastIndexOf(".") <= 0) {
            this.errMsgPic = "Please add a valid file";
          }
          if (
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/jpg" ||
            file.type === "image/gif"
          ) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", () => {
              // console.log(fileReader.result);
              // this.businessPhotosToShow.push(fileReader.result);
              // console.log(this.businessPhotosToShow);
              this.photosUpload.push(fileReader.result);
              // console.log(this.photosUpload[0].name);
              // console.log(this.photosUpload);
              // this.photoList.push(filename);
              // console.log(this.photoList);
            });
          } else {
            // console.log("done");
            this.errMsgPic = "Not an image( jpeg, png, jpg, gif ) ";
          }
        });
      } else {
        this.errMsgPic = "No new photos loaded yet ! ";
      }
    },

    showSinglePhoto(photoUri) {
      this.singlePhotoPageUri = photoUri
      this.singlePhotoPageOpen = true
    },

    updateGalleryPhotos(phototDelete) {
      // console.log(phototDelete)
      if(phototDelete >= 0) {
      this.businessPhotos.splice(phototDelete, 1)

      }
      if(this.photosUpload.length>0) {
        this.photosUpload.map(photo => {
        this.businessPhotos.push(photo)
      })
      }
      
      const variables = { 
                        vendor: this.vendor.businessTitle,
                        // fileToDelete: typeof phototDelete  === 'string' ? phototDelete : '',
                        // filesToAdd: this.photosUpload.length > 0 ? this.photosUpload : []
                        photoList: this.businessPhotos
                        }
      this.$apollo
        .mutate({
          mutation: UPDATE_GALLERY_FILES,
          variables,
          // update: (cache, { data: {updateGalleryFiles}}) => {
          //   console.log(updateGalleryFiles.photoList)
          //   // update this.vendor
          // //  this.vendor.photoList.splice(0, this.vendor.photoList.length)
          // //  console.log(this.vendor.photoList)
          // //  updateGalleryFiles.map(photoFile => {
          // //     this.vendor.photoList.push(photoFile.filename)
          // //   })
          //   // update GET_CURRENT_VENDOR query and vendor
          //   const dataVendor = cache.readQuery({query: GET_CURRENT_VENDOR})
          //   console.log(dataVendor)
          //   dataVendor.getCurrentVendor.photoList.splice(0, dataVendor.getCurrentVendor.photoList.length)

          //   updateGalleryFiles.photoList.map(photoFile => {
          //     dataVendor.getCurrentVendor.photoList.push(photoFile)
          //   })
          //   cache.writeQuery({query: GET_CURRENT_VENDOR, data:dataVendor})
            
          // }
        })
        .then(({data})=> {
          // console.log(data)
          const {photoList} = data.updateGalleryFiles
          const vendor = this.vendor
          vendor.photoList.splice(0, vendor,photoList.length)
          vendor.photoList = [...photoList]
          this.$store.commit("setVendor", vendor)
        })
        .catch(err=>console.log(err))
        this.businessPhotosToShow =  []
        this.errMsgPic =  ''
        this.photoFiles = []
        this.photosUpload = []
        this.addImgWindowOpen = false
    }
  },
};
</script>
