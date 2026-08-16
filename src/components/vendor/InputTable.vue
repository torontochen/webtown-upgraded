<template>
  <v-data-table :headers="headers" :items="itemsBound">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title class="font-weight-bold text-primary subtitle-1"
          >Items Bound</v-toolbar-title
        >
        <v-spacer></v-spacer>
        
        <v-dialog v-model="dialog" max-width="700">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              theme="dark"
              class="mb-2" v-bind="props" 
              x-small
              :disabled="itemsBound.length>0&&(redeemType=='CASH_DISCOUNT'||redeemType=='CASH_VALUE')"
            >
              <v-icon theme="dark"> mdi-plus </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      v-model="editedItem.description"
                      label="Item Name"
                      :items="itemDescription"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="editedItem.quantity"
                      label="Quantity"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="primary "  @click="close" class="mx-2"> Cancel </v-btn>
              <v-btn variant="flat" color="primary "  @click="save" class="mx-2"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="blue-darken-1"  @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn variant="text" color="blue-darken-1"  @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
  </v-data-table>
</template>
<script>
import _ from "lodash";

export default {
  props: ["allItemsCatalog", "inputItemsBound", "redeemType"],
  // {
  //   allItemsCatalog: Array,
  //   inputItemsBound: Array,
  // },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        title: "Item Code",
        align: "start",
        sortable: true,
        key: "itemCode",
      },
      { title: "Description", key: "description" },
      { title: "Unit", key: "unit" },
      { title: "Quantity", key: "quantity" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      itemCode: "",
      description: "",
      unit: "",
      quantity: 0,
    },
    defaultItem: {
      itemCode: "",
      description: "",
      unit: "",
      quantity: 0,
    },
    itemsBound: [],
  }),

  created() {
    if (this.inputItemsBound) {
      this.itemsBound = this.inputItemsBound;
      // console.log(this.itemsBound);
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
    itemDescription() {
      // console.log(this.allItemsCatalog);
      const itemDes = this.allItemsCatalog.map((item) => {
        return item.description;
      });
      return itemDes.sort();
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  methods: {
    editItem(item) {
      this.editedIndex = this.itemsBound.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.itemsBound.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.itemsBound.splice(this.editedIndex, 1);
      this.$emit("saveItemsBound", this.itemsBound);
      this.closeDelete();
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

    save() {
      // console.log(this.editedItem);
      // console.log(this.allItemsCatalog);
      if (this.editedIndex > -1) {
        const index = _.findIndex(this.allItemsCatalog, (item) => {
          return item.description == this.editedItem.description;
        });
        // console.log(index);
        this.editedItem.itemCode = this.allItemsCatalog[index].itemCode;
        this.editedItem.unit = this.allItemsCatalog[index].unit;
        Object.assign(this.itemsBound[this.editedIndex], this.editedItem);
      } else {
        const index = _.findIndex(this.allItemsCatalog, (item) => {
          return item.description == this.editedItem.description;
        });
        this.editedItem.itemCode = this.allItemsCatalog[index].itemCode;
        this.editedItem.unit = this.allItemsCatalog[index].unit;
        this.itemsBound.push(this.editedItem);
      }
      this.$emit("saveItemsBound", this.itemsBound);
      this.close();
    },
  },
};
</script>
