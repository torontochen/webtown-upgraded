<template>
  <!-- <v-container fluid style="width: 1300px;"> -->
   
    <v-card flat  :width="viewPortDimension.width * 0.8" class="pa-3 ma-auto">
      <!-- Loading Spinner -->
          <v-row>
            <v-dialog v-model="itemCatalogLoading" persistent fullscreen>
              <v-container fill-height>
                <v-row justify="center" align-content="center">
                  <v-progress-circular
                    indeterminate
                    :size="60"
                    :width="4"
                    color="primary lighten-3"
                  ></v-progress-circular>
                </v-row>
              </v-container>
            </v-dialog>
          </v-row>


      <v-card-title class="text-primary"
        >Product and Service Catalog</v-card-title
      >
      <v-card-text>
        <v-row>
          <!-- Products Category -->
          <v-col cols="6">
            <v-select variant="outlined"
              v-model="categorySeleted"
              :items="category"
              label="Business Category " density="compact"
              :disabled="inEdit"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-select variant="outlined"
              v-model="subCategorySeleted"
              :items="subCategoryHandler"
              label="Subcategory" density="compact"
              :disabled="!categorySeleted || inEdit"
              @change="changeSubcateHandler"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- item catalog added -->
      <v-card-text>
        <!-- <v-card flat> -->
          <v-data-table
            :headers="headers"
            :items="itemCatalogList"
            class="elevation-1"
            calculate-widths
          >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title
                    class="font-weight-bold text-primary subtitle-1"
                    >{{ subCategorySeleted }}</v-toolbar-title
                  >
                  <!-- <v-divider
                          class="mx-4"
                          inset
                          vertical
                          ></v-divider> -->
                  <v-spacer></v-spacer>
                  <!-- add item catalog dialog -->
                  <v-dialog v-model="dialog"  width="900" height="700"  persistent>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="primary"
                        theme="dark"
                        class="mb-2" v-bind="props" icon size="small"
                        :disabled="!subCategorySeleted"
                      >
                        <v-icon theme="dark"> mdi-plus </v-icon>
                      </v-btn>
                    </template>
                   
                      <v-card width="900" height="700" >
                        <v-form lazy-validation ref="form" > 
                        <v-card-title class="ml-4 mt-4">
                          <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                          <v-container>
                            <!-- row 1 -->
                            <v-row>
                              <v-col cols="3">
                                <v-text-field
                                  v-model.trim="editedItem.itemCode"
                                  label="Item Code"
                                  hint="Item Code has to be unique"
                                  @blur="checkItemCode"
                                  :error-messages="errMsgDup"
                                  :rules="itemCodeRule" density="compact"
                                ></v-text-field>
                              </v-col>

                              <v-col cols="9">
                                <v-text-field
                                  v-model="editedItem.description"
                                  hint="Description has to be unique"
                                  label="Description"
                                  @blur="checkDescription"
                                  :error-messages="errMsgDes"
                                  :rules="descriptionRule" density="compact"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <!-- row 2 -->
                            <v-row justify="end">
                              <v-col cols="3">
                                <!-- <v-select variant="outlined"
                                      v-model="editedItem.unit"
                                      :items="unitList"
                                      label="Unit" density="compact"
                                  ></v-select> -->
                                <v-text-field
                                  label="Unit" density="compact"
                                  :rules="unitRule"
                                  v-model.trim="editedItem.unit"
                                  hint="such as box, pack, bag, kg, foot, hour, pax, head, times..."
                                ></v-text-field>
                              </v-col>
                                <v-col cols="3">
                                <v-text-field density="compact"
                                  label="Reward Silver"
                                  v-model.number="editedItem.rewardSilver">
                                </v-text-field>
                              </v-col>
                              <v-col cols="3">
                                <span
                                  >Load photos ( jpeg, png, jpg, gif ) only
                                </span>
                                <v-file-input
                                  label="Load photos ( jpeg, png, jpg, gif ) only"
                                  color="primary"
                                  show-size
                                  hide-input
                                  @change="onFilePicked"
                                  :error-messages="errMsg"
                                ></v-file-input>
                              </v-col>
                            
                              <v-col cols="3">
                                <v-img
                                  :src="editedItem.photo"
                                  style="
                                    margin-left: auto;
                                    margin-right: auto;
                                    width: 50%;
                                  "
                                ></v-img>
                              </v-col>
                              
                            </v-row>
                            <!-- row 3 -->
                            <v-row>
                              <v-col cols="12" sm="6" md="4">
                                <v-text-field
                                  v-model.number="editedItem.rate"
                                  prefix="$"
                                  label="Rate"
                                  :rules="priceRules" density="compact"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-text-field
                                  v-model.number="editedItem.promoRate"
                                  prefix="$"
                                  label="Promotion Rate"
                                  :rules="promoRules" density="compact"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-switch
                                  v-model="editedItem.active"
                                  label="Active"
                                  density="compact"
                                ></v-switch>
                              </v-col>
                            </v-row>
                            <!-- row 4 -->
                            <v-row>
                              <v-col cols="12">
                                <v-textarea density="compact"
                                  background-color="grey lighten-3"
                                  color="cyan"
                                  label="Product Specfication"
                                  v-model="editedItem.specification"
                                  clearable>
                                </v-textarea>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <v-row>
                              <v-spacer></v-spacer>
                              <v-btn variant="text" color="warning"  v-if="priceError!=' '">{{priceError}}</v-btn>
                              <v-spacer></v-spacer>
                          </v-row>
                          <v-row>
                              <v-spacer></v-spacer>
                           <v-btn variant="flat" color="primary" class="ma-3"  @click="save"> Save </v-btn>
                          <v-btn variant="text" color="primary" class="ma-3" @click="close">
                            Cancel
                          </v-btn>
                          <v-spacer></v-spacer>
                          </v-row>
                        
                        </v-card-actions>
                        </v-form>
                      </v-card>
                    
                  </v-dialog>

                  <!-- delete item catalog warning dialog -->
                  <v-dialog v-model="dialogDelete" max-width="500px" persistent>
                    <v-card style="border-top: 15px solid #B75420">
                      <v-card-title class="text-subtitle-1 text-accent">{{
                        lastItemWarning
                          ? "Last Item! can not delete"
                          : "Are you sure you want to delete this item?"
                      }}</v-card-title>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn variant="flat" color="primary"  @click="closeDelete"
                          >Cancel</v-btn
                        >
                        <v-btn variant="text"
                          color="blue darken-1" 
                          @click="deleteItemConfirm"
                          :disabled="lastItemWarning"
                          >OK</v-btn
                        >
                        <v-spacer></v-spacer>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon small color="primary" class="mr-2" @click="editItem(item)" >
                  mdi-pencil
                </v-icon>
                <v-icon small color="primary" @click="deleteItem(item)" class="mr-2"> mdi-delete </v-icon>
                <v-icon small color="accent" v-if="item.event=='Yes'"> mdi-eventbrite </v-icon>
              </template>

              <template v-slot:item.photo="{ item }">
                <v-img :src="item.photo" height="40" width="40"></v-img>
              </template>

              <template v-slot:item.description="{ item }">
                <span>{{ $filters.ellipsisDescription(item.description) }}</span>
              </template>
          </v-data-table>
          <v-row justify="center" class="my-10">
            <v-btn variant="flat" color="primary" class="d-block mr-2"  @click="resetHandler">
              Reset
            </v-btn>

            <v-btn variant="text" color="primary" @click="handleCancel"
              >Exit</v-btn
            >
          </v-row>
        <!-- </v-card> -->
      </v-card-text>


    <!-- <v-dialog v-model="exitDialog" width="400" persistent transition="fade">
      <v-card>
        <v-card-title class="headline" style="color: #ff9800"
          >Leaving Product and Service</v-card-title
        >

        <v-card-text style="color: #ff9800" class="body-1">
          Are you Sure ? All unsaved change will be lost!
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="#ff9800"  @click="handleCancel"> Yes </v-btn>

          <v-btn variant="text" color="#ff9800"  @click="exitDialog = false"> No </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
    </v-card>
    <!-- <CustomDialog
      v-model="showDialog"
      @yes-leave="yesLeave"
      @abort-leave="abortLeave"
      ref="dia"
      component="Sign Up Vendor"
    /> -->
  
  <!-- </v-container> -->
</template>

<script>
import { mapGetters } from "vuex";
import _, { now } from "lodash";
import { CHECK_ITEMCODE } from "../../queries/queries_query"

export default {
  name: "productService",
  data() {
    return {
      active: true,
      category: ["product", "service"],
      categorySeleted: "",
      descriptionRule: [
        (description) => !!description || "Description is required",
      ],
      dialog: false,
      dialogDelete: false,
      defaultItem: {
        subcategory: "",
        itemCode: "",
        description: "",
        specification: "",
        rewardSilver: 0,
        photo: null,
        unit: "",
        rate: 0.0,
        promoRate: 0.0,
        active: true,
        event: "No",
        taxRate:0.13
      },
      inEdit: false,
      editedIndex: -1,
      editedItem: {
        subcategory: "",
        itemCode: "",
        description: "",
        specification: "",
        rewardSilver: 0,
        photo: null,
        unit: "",
        rate: 0.0,
        promoRate: 0.0,
        active: true,
        event: "No",
        taxRate: 0.13
      },
      errMsg: "",
      errMsgDup: "",
      errMsgDes: "",
      exitDialog: false,
      headers: [
        {
          text: "Item Code",
          align: "start",
          sortable: true,
          value: "itemCode",
        },
        { text: "Description", value: "description" },
        { text: "Picture", value: "photo" },
        { text: "Unit", value: "unit" },
        { text: "Rate($)", value: "rate" },
        { text: "Promotion Rate($)", value: "promoRate" },
        { text: "Active", value: "active" },
        { text: "On Event", value: "event" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      itemCatalogList: [],
      itemCodeRule: [(itemCode) => !!itemCode || "Item Code is required"],
      lastItemWarning: false,
      productSubCategory: [],
      promoRate: 0,
      priceRules: [price => price > 0 || "The rate has to be larger than 0" ],
      promoRules: [price => price >= 0 || "The rate can't be less than 0" ],
      priceError: ' ',
      serviceSubCategory: [],
      subCategorySeleted: null,
      unitList: [
        "g",
        "kg",
        "inch",
        "foot",
        "ounce",
        "meter",
        "pack",
        "each",
        "pax",
        "hour",
        "pound",
        "minute",
        "Other",
      ],
      unitRule: [(unit) => !!unit || "Unit is required"],
    };
  },
  mounted() {
    window.addEventListener("beforeunload", function (event) {
      // console.log(event);
      event.returnValue = "ok";
    });
    const { businessCategory } = this.vendor;
    businessCategory.map((item) => {
      // console.log(item);
      if (_.startsWith(item, "product")) {
        this.productSubCategory.push(item);
      }
      if (_.startsWith(item, "service")) {
        this.serviceSubCategory.push(item);
      }
      if (!_.startsWith(item, "product") && !_.startsWith(item, "service")) {
        this.category = [];
        this.category.push(item);
      }
    });
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    itemCatalogSaved(val) {
      // console.log(val);
      if (val) {
        this.itemCatalogList = [...this.itemCatalogSaved.itemDetailed];
      }
    },
    // editedItem(val) {

    // },

    subCategorySeleted(val) {
      this.defaultItem.subcategory = val
      this.editedItem.subcategory = val
    }
  },
  computed: {
    ...mapGetters(["vendor", "itemCatalogSaved", 'viewPortDimension', "itemCatalogLoading","vendorPromotionEvents"]),
    
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
    subCategoryHandler() {
      // console.log(this.category);
      if (this.category.length > 0) {
        switch (this.categorySeleted) {
          case "product":
            return this.productSubCategory;
          case "service":
            return this.serviceSubCategory;
          default:
            return this.category;
        }
      }
    },
  },
  methods: {
    editItem(item) {
      // console.log(item);
      this.editedIndex = this.itemCatalogList.indexOf(item);
      // console.log(this.editedIndex);
      this.editedItem = Object.assign({}, item);
      // console.log(this.editedItem)
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.itemCatalogList.indexOf(item);
      this.lastItemWarning = false;
      if (this.itemCatalogList.length == 1) {
        this.lastItemWarning = true;
        this.dialogDelete = true;
      } else {
        this.editedItem = Object.assign({}, item);
        this.dialogDelete = true;
      }
    },

    deleteItemConfirm() {
      this.itemCatalogList.splice(this.editedIndex, 1);
      this.$store.dispatch("saveItemCatalog", {
        input: {
          businessTitle: this.vendor.businessTitle,
          itemDetailed: this.itemCatalogList,
        },
      });
      this.closeDelete();
    },

    changeSubcateHandler() {
      // console.log("run changeSub");
      this.$store.dispatch("getItemCatalog", {
        businessTitle: this.vendor.businessTitle,
        subcategory: this.subCategorySeleted,
        // time: Date.now().toString(),
      });

      this.inEdit = true;
    },

    checkItemCode() {
      this.errMsgDup = "";
      // const isDuplicated = _.findIndex(this.itemCatalogList, (item) => {
      //   return item.itemCode === this.editedItem.itemCode;
      // });
      this.$apollo
        .query({
          query: CHECK_ITEMCODE,
          variables: {vendor: this.vendor.businessTitle, itemCode: this.editedItem.itemCode}
        })
        .then(({data}) => {
          const { checkItemCode } = data
          if ( checkItemCode.ok ) {
            this.errMsgDup = "Item Code Duplicated";
          }
        })
        .catch(err => console.error(err))
    },

    checkDescription() {
      this.errMsgDes = "";
      const isDuplicated = _.findIndex(this.itemCatalogList, (item) => {
        return item.description === this.editedItem.description;
      });
      if (isDuplicated > -1) {
        this.errMsgDes = "Description Duplicated";
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    handleCancel() {
      this.itemCatalogList = [];
      // this.exitDialog = false;
      this.$store.dispatch("getAllItemsCatalog", {
        businessTitle: this.vendor.businessTitle,
        time: Date.now().toString(),
      });
      this.$store.commit("setInDesign", false);
      this.$router.push("/");
    },
    onFilePicked(File) {
      if (File) {
        this.errMsg = "";
        // console.log(File);
        let filename = File.name;
        if (filename.lastIndexOf(".") <= 0) {
          this.errMsg = "Please add a valid file";
        }
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
            this.editedItem.photo = fileReader.result;
          });
        } else {
          this.errMsg = "Not an image( jpeg, png, jpg, gif ) ";
        }
      } else {
        this.errMsg = "No new photos loaded yet ! ";
      }
    },
    // otherUnitHandler() {
    //     this.editedItem.unit = this.otherUnit
    // },
    save() {
      this.priceError = ' '
      if(this.editedItem.rewardSilver > this.editedItem.rate * 1000 || 
    this.editedItem.promoRate > 0 ? this.editedItem.rewardSilver > this.editedItem.promoRate * 1000 : false)
      {
        this.priceError = 'The Reward Silver Is Over Price!!!'
      }
      if (this.$refs.form.validate()) {
        this.editedItem.event = this.editedItem.promoRate > 0 ? 'Yes' : 'No'
        const editedItem = {
                            subcategory: this.editedItem.subcategory,
                            itemCode: this.editedItem.itemCode,
                            description: this.editedItem.description,
                            specification: this.editedItem.specification,
                            rewardSilver: this.editedItem.rewardSilver,
                            photo: this.editedItem.photo,
                            unit: this.editedItem.unit,
                            rate: this.editedItem.rate,
                            promoRate: this.editedItem.promoRate,
                            active: this.editedItem.active,
                            event: this.editedItem.event,
                            taxRate: 0.13,
                            }
      //  console.log(this.editedItem)
        if (this.editedIndex > -1) {
          // Object.assign(
          //   this.itemCatalogList[this.editedIndex],
          //   this.editedItem
          // );
          // this.itemCatalogList[this.editedIndex] = editedItem
          const itemCatalogList = this.itemCatalogList.map((item, i) => {
            if (i == this.editedIndex) {
              return editedItem
            } else {
              return {
                            subcategory: item.subcategory,
                            itemCode: item.itemCode,
                            description: item.description,
                            specification: item.specification,
                            rewardSilver: item.rewardSilver,
                            photo: item.photo,
                            unit: item.unit,
                            rate: item.rate,
                            promoRate: item.promoRate,
                            active: item.active,
                            event: item.event,
                            taxRate: 0.13,
                            }
            }
          })
        //    const itemDetailed = this.itemCatalogList.map(item => {
        //   return item
        // })
        this.itemCatalogList =[]
        this.itemCatalogList = [...itemCatalogList]
          // console.log(this.itemCatalogList)
          this.$store.dispatch("saveItemCatalog", {
            input: {
              businessTitle: this.vendor.businessTitle,
              itemDetailed: itemCatalogList
            },
          });
        } else {
          console.log(this.itemCatalogList)
          this.itemCatalogList.push(editedItem);
           const itemCatalogList = this.itemCatalogList.map((item, i) => {
            if (i == this.editedIndex) {
              return editedItem
            } else {
              return {
                            subcategory: item.subcategory,
                            itemCode: item.itemCode,
                            description: item.description,
                            specification: item.specification,
                            rewardSilver: item.rewardSilver,
                            photo: item.photo,
                            unit: item.unit,
                            rate: item.rate,
                            promoRate: item.promoRate,
                            active: item.active,
                            event: item.event,
                            taxRate: 0.13,
                            }
            }
          })
          console.log(itemCatalogList)
          this.$store.dispatch("saveItemCatalog", {
            input: {
              businessTitle: this.vendor.businessTitle,
              itemDetailed: itemCatalogList
            },
          });
        }
        this.close();
      }
    },
    resetHandler() {
      this.itemCatalogList = [];
      this.inEdit = false;
      this.categorySeleted = null;
      this.subCategorySeleted = null;
    },
  },
};
</script>
