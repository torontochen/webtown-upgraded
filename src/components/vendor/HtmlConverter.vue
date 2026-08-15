<template>
  <v-container class="mt-n7">
      <v-container fluid >
        <!-- <v-card outlined tile class="ml-6"> -->
          <v-card  tile  color="shade" class="pa-3">
            <!-- <v-container fluid> -->
              <v-card-text>
                 <v-row >
                <v-col
                  cols="6"
                  align-self="center"
                  class="primary--text text-subtitle-2 "
                >
                  <span>
                    {{ originType ? originType : type }} in Design:{{ flyerId }}
                    <!-- {{
                      originType !== "template" && origin !== "template"
                        ? flyerId
                        : "new"
                    }} -->
                  </span>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    text
                    v-model.trim="flyerTitle"
                    label="Title"
                    required
                    :rules="flyerTitleRules"
                    hint="' : ' is not allowed"
                    :error-messages="checkFlyerTitle"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              </v-card-text>
             
            <!-- </v-container> -->
          </v-card>
        <!-- </v-card> -->
          <v-toolbar flat dense color="shade3" class="ma-6 mt-2">
            <!-- color="rgba(122, 108, 203, 0.5)" -->
            <v-btn-toggle color="primary" dense group class="d-block ml-10">
              <!-- Add element -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="1"
                    text
                    v-on="on"
                    @click="addElement"
                    :disabled="editStatus"
                  >
                    <v-icon>mdi-shape-polygon-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add Element</span>
              </v-tooltip>

              <!-- Add Page -->
              <v-tooltip top v-if="checkType">
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="5"
                    text
                    v-on="on"
                    :disabled="editStatus || pageSave.length == 0"
                    @click="addPage"
                  >
                    <v-icon>mdi-shape-rectangle-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add Page</span>
              </v-tooltip>

              <!-- Flyer Background Color -->
              <v-menu
                bottom
                offset-y
                nudge-bottom="8"
                transition="scroll-y-reverse-transition"
                :close-on-content-click="closeOnContentClick"
              >
                <template v-slot:activator="{ on: menu }">
                  <v-tooltip top>
                    <template v-slot:activator="{ on: tooltip }">
                      <v-btn :value="4" text v-on="{ ...tooltip, ...menu }">
                        <v-icon class="d-block mt-1"
                          >mdi-format-color-fill</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Flyer Background Color</span>
                  </v-tooltip>
                </template>
                <v-color-picker
                  mode="hexa"
                  :value="color"
                  @input="changeBackgroundColor"
                ></v-color-picker>
              </v-menu>

              <!-- QR code -->
              <!-- <v-tooltip
                top
                v-if="type!=='FLYER'"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="3"
                    text
                    v-on="on"
                    @click="addQr"
                  >
                    <v-icon>mdi-qrcode</v-icon>
                  </v-btn>
                </template>
                <span>Add QR</span>
              </v-tooltip> -->

              <!-- Delete -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="3"
                    text
                    v-on="on"
                    :disabled="!editStatus || !editId"
                    @click="deleteElement"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Delete Element</span>
              </v-tooltip>
            </v-btn-toggle>

            <v-spacer></v-spacer>
            <v-switch
              v-model="borderLined"
              class="d-block mt-5 mr-2"
              dense
              :label="borderLined ? 'Dotted Line' : 'None'"
              :disabled="!editStatus"
            ></v-switch>

            <v-tooltip v-if="editStatus" top>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="quitEdit"
                  x-small
                  depressed
                  v-on="on"
                  color="primary"
                  outlined
                  class="d-block mx-2 "
                >
                  Design
                  <!-- <v-icon
                x-small
                color="primary"
                dense
              >mdi-pencil-box-outline</v-icon> -->
                </v-btn>
              </template>
              <span>Switch to design mode</span>
            </v-tooltip>
            <v-tooltip top v-else>
              <template v-slot:activator="{ on }">
                <v-btn
                  x-small
                  color="primary"
                  dark
                  depressed
                  class="d-block mx-2"
                  v-on="on"
                  @click="toEdit"
                  :disabled="pageNoWatcher.length == 0"
                >
                  Edit
                  <!-- <v-icon
                x-small
                color="primary"
              >mdi-pencil</v-icon> -->
                </v-btn>
              </template>
              <span> Switch to edit mode</span>
            </v-tooltip>
          </v-toolbar>
       
      </v-container>

      <v-container class="ml-n3 px-n6">
        <v-row>
          <v-col cols="1">
            <v-tooltip left open-on-hover>
              <template v-slot:activator="{ on }">
                <v-slider
                  v-model="sliderV"
                  :max="maxSliderV"
                  :min="minSliderV"
                  vertical
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-9 "
                  v-on="on"
                ></v-slider>
              </template>
              <span
                >Flyer height is {{ minSliderV }}px to {{ maxSliderV }}px</span
              >
            </v-tooltip>
          </v-col>
          <v-col cols="11">
            <v-tooltip top open-on-hover>
              <template v-slot:activator="{ on }">
                <v-slider
                  v-model="sliderH"
                  :max="maxSliderH"
                  :min="minSliderH"
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-n2 ml-n2"
                  open-on-hover
                  v-on="on"
                >
                </v-slider>
              </template>
              <span
                >Flyer width is {{ minSliderH }}px to {{ maxSliderH }}px</span
              >
            </v-tooltip>

            <v-card
              hover
              outlined
              :width="sliderH"
              :height="sliderV"
              style="border-style: dotted;"
              class="ma-0 pa-0"
            >
              <!-- <v-row> -->
                <!-- style="
                     border: 2px dashed rgba(122, 108, 203, 0.5);
                     border-radius: 4px;
                      position: relative;
                    " -->
                <div
                  :style="{
                    backgroundColor: flyerBackgroundColor,
                    height: sliderV + 'px',
                    width: sliderH + 'px',
                    border:
                      type == 'FLYER' || originType == 'Flyer'
                        ? '1px solid rgba(122, 108, 203, 0.5)'
                        : '2px dashed rgba(122, 108, 203, 0.5)',
                    borderRadius: '4px',
                    position: 'relative',
                  }"
                  v-for="(flyerPage, pageIndex) in pageSave"
                  v-show="pageSave.length > 0"
                  :key="pageIndex"
                  :id="flyerPage.nodeId"
                >
                  <v-img
                    v-if="
                      (type && type !== 'FLYER') ||
                        (originType && originType !== 'FLYER')
                    "
                    :src="qrPic"
                    width="50"
                    height="50"
                    style="position:absolute; right: 3px; bottom: 3px"
                  ></v-img>
                  <!-- <v-icon
                    v-if="
                      (type && type !== 'FLYER') ||
                        (originType && originType !== 'FLYER')
                    "
                    style="position:absolute; right: 3px; bottom: 3px"
                    color="black"
                    size="72">mdi-qrcode</v-icon> -->
                    <!-- :style="source?item.htmlOuterStyle:''" -->

                  <vue-draggable-resizable
                    class="ma-0 pa-0"
                    v-for="(item, index) in flyerPage.flyerPageElements"
                    :key="index"
                    :id="item.id"
                    :w="item.w"
                    :h="item.h"
                    :x="item.x"
                    :y="item.y"
                     @dragging="onDrag"
                    @resizing="onResize"
                    @activated="itemClicked(pageIndex, index)"
                    style="borderStyle: 'none' "
                    @click.native="
                      editClickElement(item, index, flyerPage.nodeId)
                    "
                  >
                    <!-- :style="{ borderStyle: borderLined ? 'dotted' : 'none' }" -->
                  </vue-draggable-resizable>
                </div>
              <!-- </v-row> -->
            </v-card>

            <v-row>
              <v-col cols="10">
                 <!-- pagination of flyer pages -->
                <v-pagination
                  v-model="pageNo"
                  :length="pages"
                  total-visible="5"
                  class="mt-4 elevation-0"
                ></v-pagination>
              </v-col>
              <v-col cols="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="deletePage"
                      text
                      class="d-clock mt-6"
                      :disabled="pages <= 1"
                    >
                      <v-icon color="primary">mdi-delete-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete Current Page</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
  </v-container>
</template>


<script>
import moment from "moment";
import { mapGetters } from "vuex";
import VueDraggableResizable from "vue-draggable-resizable";
// optionally import default styles
import "vue-draggable-resizable/dist/VueDraggableResizable.css";
import _ from "lodash";
import { now } from "moment";
import sizeOf from "object-sizeof";
import LZString from "lzutf8";
import {
  eventBus_editElement,
  eventBus_addPage,
  eventBus_preview,
  eventBus_saveSketch,
  eventBus_appendHook,
  eventBus_saveTemplate,
  eventBus_saveFlyer,
} from "../../eventBus";
export default {
  components: {
    "vue-draggable-resizable": VueDraggableResizable,
  },
  props: ["htmlInner", "type"],
  data() {
    return {
      borderLined: true,
      businessTitle: '',
      closeOnContentClick: false,
      color: null,
      editPageId: "", // the page id under edit
      editId: null, // the element id under edit
      editIndex: null, // to indicate the index number of element under edit
      editStatus: false, // to indicate if it is under edit mode
      flyerTitleRules: [(title) => !!title || "The title is required"],
      flyerTitle: "My Flyer",
      flyerId: null,
      firstColor: true,
      flyerBackgroundColor: "#FFFFFF",
      itemIndex: null,
      maxSliderH: 980,
      minSliderH: 200,
      maxSliderV: 720,
      minSliderV: 200,
      originType: null,
      origin: null, // from sketch or template
      pageNoWatcher: [], // to control the final updated pages in pagesave
      pageSave: [], // contain all data of pages in flyer including not available one for final rendering
      pages: 1,
      pageIndex: null,
      pageNo: 1, // the page no of pagination
      preview: [], // the array for preview
      qrPic:
        "data:image/png;base64,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",
      sliderH: 720,
      sliderV: 230,
      zeroElement: true, // to indicate if there is no any element on single page
    };
  },
  created() {
    console.log("htmlconverter created");
    console.log(this.source)
    if (this.source) {
      // console.log(this.source);
      const {
        sketchPages,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        origin,
      } = this.source;
      this.pageSave = sketchPages;
      if (origin !== "template") {
        this.flyerId = flyerId;
        this.flyerTitle = flyerTitle;
      } else {
        this.flyerId =
          this.vendor.businessTitle.replace(/\s/g, "") +
          "_" +
          type +
          "_" + Date.now().toString()
          // moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
      }
      this.originType = type;
      this.$store.commit("setFlyerFormatType", type);
      // console.log(type);
      this.flyerBackgroundColor = backgroundColor;
      this.sliderH = width;
      this.sliderV = height;
      this.origin = origin;
    }
  },
  mounted() {
    this.businessTitle = this.vendor.businessTitle.replace(/\s/g, "")
    if (this.source) {
      const parser = new DOMParser();
      const revisedPageSave = this.pageSave.map((item, index, pageArray) => {
        const pageNode = document.getElementById(item.nodeId);
        // console.log(pageNode);
        if (this.originType !== "FLYER") {
          const QR = `<img
                    src=${this.qrPic}
                    style="width: 50px; height: 50px; position:absolute; right: 3px; bottom: 3px"
                  ></img>`;
             
          const qrDoc = parser.parseFromString(QR, "text/html");
          // console.log(qrDoc.body);
          pageNode.appendChild(qrDoc.body);
        }

        const revisedElements = item.flyerPageElements.map(
          (elementItem, index, array) => {
            // console.log(elementItem.htmlOuter);

            // console.log(array);
            const elementNode = document.getElementById(elementItem.id);
            const decompressedInner = LZString.decompress(
              elementItem.htmlInner,
              { inputEncoding: "Base64" }
            );
            const doc = parser.parseFromString(decompressedInner, "text/html");
            // console.log(doc.body);
            elementNode.appendChild(doc.body);
            elementNode.style = elementItem.htmlOuterStyle;
            const pPos = decompressedInner.indexOf("<p>");
            const nodeInnerHtml = decompressedInner.substr(pPos);
            // console.log(nodeInnerHtml);
            // console.log(elementNode.innerHTML);
            array[index].htmlInner = "<body>" + nodeInnerHtml;
            array[index].htmlOuter = elementNode.outerHTML;
            array[index].htmlOuterStyle = elementNode.style.cssText;
            array[index].x = elementItem.x;
            array[index].y = elementItem.y;
            array[index].w = elementItem.w;
            array[index].h = elementItem.h;
            return {
              id: elementItem.id,
              htmlInner: "<body>" + nodeInnerHtml,
              htmlOuter: elementNode.outerHTML,
              htmlOuterStyle: elementNode.style.cssText,
              x: elementItem.x,
              y: elementItem.y,
              w: elementItem.w,
              h: elementItem.h
            };
            // _.omit(elementItem, ["_typename"]);
          }
        );

        this.preview.push({
          id: item.nodeId,
          previewString: pageNode.outerHTML,
        });
        if (index !== 0) {
          pageNode.style.display = "none";
        }
        this.pageNoWatcher.push({
          pageNo: index + 1,
          pageId: item.nodeId,
        });

        // _.omit(item, ["_typename"]);
        return {
          nodeId: item.nodeId,
          flyerPageElements: revisedElements,
        };
      });
      // console.log(revisedPageSave);
      this.pageSave = revisedPageSave;
      // console.log(this.pageSave);
      this.pages = this.pageSave.length;
      this.pageNo = 1;
      // eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
    }

  //  Do Preview
    eventBus_preview.$on("doPreview", (eventValue) => {
      // console.log(this.preview);
      // console.log(this.pageNoWatcher);
      // console.log(this.pageNo);
      const previewIndex = _.findIndex(this.preview, (item) => {
        return item.id == this.pageNoWatcher[this.pageNo - 1].pageId;
      });
      // console.log(previewIndex);
      if (previewIndex > -1) {
        // console.log(
        //   document.getElementById(this.pageNoWatcher[this.pageNo - 1].pageId)
        // );
        if (
          document.getElementById(this.pageNoWatcher[this.pageNo - 1].pageId)
        ) {
       
          this.preview[previewIndex].previewString = document.getElementById(
            this.pageNoWatcher[this.pageNo - 1].pageId
          ).outerHTML;
          // console.log(this.preview[previewIndex].previewString)
        }
      }
      this.$store.commit("clearPagePreview");
      this.$store.commit("setPagePreview", this.preview);
    });

    //Save Sketch
    eventBus_saveSketch.$on("saveSketch", () => {
      // console.log("save sketch at start");
      this.$store.commit("clearError");
      // console.log(this.pageSave);

      const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
        // console.log(item);
        return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
      });
      // console.log(this.pageNoWatcher);
      // console.log(this.pageSave);
      // console.log(this.pageSave[pageSaveIndex]);
      this.pageSave[pageSaveIndex].flyerPageElements.map(
        (element, index, array) => {
          // console.log(array)
          const elementNode = document.getElementById(element.id);
          if (elementNode && element.htmlInner !== "") {
            array[index].htmlInner = elementNode.innerHTML;
            array[index].htmlOuter = elementNode.outerHTML;
            array[index].htmlOuterStyle = elementNode.style.cssText;
            array[index].x = element.x;
            array[index].y = element.y;
            array[index].w = element.w;
            array[index].h = element.h;
          }
        }
      );
      let sketchToSave = [];
      this.pageSave.map((pageSaveItem, index, toSaveArray) => {
        // console.log(pageSaveItem);
        let flyerPageElementsToSave = [];
        pageSaveItem.flyerPageElements.map((element, elementIndex) => {
          if (element.htmlInner !== "") {
            flyerPageElementsToSave.push({
              htmlInner: LZString.compress(element.htmlInner, {
                outputEncoding: "Base64",
              }),
              htmlOuter: LZString.compress(element.htmlOuter, {
                outputEncoding: "Base64",
              }),
              htmlOuterStyle: element.htmlOuterStyle,
              x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
              id: element.id,
            });
          }
        });

        // console.log(flyerPageElementsToSave )
        const pageOkIndex = _.findIndex(this.pageNoWatcher, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex > -1) {
          sketchToSave.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }

       
      });
      // console.log(sketchToSave);
      const input = {
        sketchPages: sketchToSave,
        flyerId: this.flyerId,
        flyerTitle: this.flyerTitle,
        type: this.originType ? this.originType : this.type,
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        businessTitle: this.vendor.businessTitle,
      };
      // console.log("save sketch");
      // console.log(Math.round(sizeOf(input) / (1024 * 1024)));
      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        // console.log("save sketch");
        this.$store.dispatch("saveSketch", {
          input,
        });
        sketchToSave = [];
        this.$store.commit("setInDesign", false);
      } else {
        this.$store.commit(
          "setError",
          "This size of draft is over limit, please downsize photos or texts"
        );
        return;
      }
    });

    //Save Flyer
    eventBus_saveFlyer.$on("saveFlyer", () => {
      console.log("save flyer at start");
      this.$store.commit("clearError");
      // console.log(this.flyerId);
      const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
        // console.log(item);
        return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
      });
      // console.log(this.pageNoWatcher);
      // console.log(this.pageSave);
      // console.log(this.pageSave[pageSaveIndex]);
      this.pageSave[pageSaveIndex].flyerPageElements.map(
        (element, index, array) => {
          const elementNode = document.getElementById(element.id);
          if (elementNode && element.htmlInner !== "") {
            array[index].htmlInner = elementNode.innerHTML;
            array[index].htmlOuter = elementNode.outerHTML;
            array[index].htmlOuterStyle = elementNode.style.cssText;
            array[index].x = element.x;
            array[index].y = element.y;
            array[index].w = element.w;
            array[index].h = element.h;
          
          }
        }
      );
      let flyerToSave = [];
      this.pageSave.map((pageSaveItem, index, toSaveArray) => {
        // console.log(pageSaveItem);
        let flyerPageElementsToSave = [];
        pageSaveItem.flyerPageElements.map((element, elementIndex) => {
          if (element.htmlInner !== "") {
            flyerPageElementsToSave.push({
              htmlInner: LZString.compress(element.htmlInner, {
                outputEncoding: "Base64",
              }),
              htmlOuter: LZString.compress(element.htmlOuter, {
                outputEncoding: "Base64",
              }),
              htmlOuterStyle: element.htmlOuterStyle,
              id: element.id,
               x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
            });
          }
        });

        const pageOkIndex = _.findIndex(this.pageNoWatcher, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex > -1) {
          flyerToSave.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }

       
        if (this.type !== "FLYER") {
           const pageNodeToSave = document.getElementById(pageSaveItem.nodeId);
        // console.log(pageNodeToSave);
          // console.log(pageSaveItem.nodeId)
          const parser = new DOMParser();
          const QR = `<body><p><img
                    src=${this.qrPic}
                    style="width: 50px; height: 50px; position:absolute; right: 3px; bottom: 3px"
                  ></img></p></body>`;
             
          const qrDoc = parser.parseFromString(QR, "text/html");
          // console.log(qrDoc.body);
          pageNodeToSave.appendChild(qrDoc.body);
          pageNodeToSave.style.display = ""
          // console.log(pageNodeToSave)
          this.preview[index].previewString = pageNodeToSave.outerHTML
          this.preview[index].id = pageSaveItem.nodeId
         this.$store.commit("clearPagePreview");
      this.$store.commit("setPagePreview", this.preview)
        }
        

      });
      // console.log(sketchToSave);
      // this.$store.commit("clearPagePreview");
      // this.$store.commit("setPagePreview", this.preview)
      // console.log(this.preview)
      const input = {
        sketchPages: flyerToSave,
        flyerId: this.flyerId,
        flyerTitle: this.flyerTitle,
        type: this.originType ? this.originType : this.type,
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        businessTitle: this.vendor.businessTitle,
        couponPages: this.preview,
      };
      // console.log("save flyer");
      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        this.$store.dispatch("saveFlyer", {
          input,
        });
        flyerToSave = [];
      } else {
        this.$store.commit(
          "setError",
          "This size of flyer is over limit, please downsize photos or texts"
        );
        return;
      }
    });

    // Save Template
    eventBus_saveTemplate.$on("saveTemplate", (eventValue) => {
      console.log("save template at start");
      this.$store.commit("clearError");
      // console.log(this.flyerId);
      const { templateChoice, templateId, templateTagName } = eventValue;
      const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
        // console.log(item);
        return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
      });
      // console.log(this.pageNoWatcher);
      // console.log(this.pageSave);
      // console.log(this.pageSave[pageSaveIndex]);
      this.pageSave[pageSaveIndex].flyerPageElements.map(
        (element, index, array) => {
          const elementNode = document.getElementById(element.id);
          if (elementNode && element.htmlInner !== "") {
            array[index].htmlInner = elementNode.innerHTML;
            array[index].htmlOuter = elementNode.outerHTML;
            array[index].htmlOuterStyle = elementNode.style.cssText;
            array[index].x = element.x;
            array[index].y = element.y;
            array[index].w = element.w;
            array[index].h = element.h;
          }
        }
      );
      let templateToSave = [];
      this.pageSave.map((pageSaveItem, index, toSaveArray) => {
        // console.log(pageSaveItem);
        let flyerPageElementsToSave = [];
        pageSaveItem.flyerPageElements.map((element, elementIndex) => {
          if (element.htmlInner !== "") {
            flyerPageElementsToSave.push({
              htmlInner: LZString.compress(element.htmlInner, {
                outputEncoding: "Base64",
              }),
              htmlOuter: LZString.compress(element.htmlOuter, {
                outputEncoding: "Base64",
              }),
              htmlOuterStyle: element.htmlOuterStyle,
              id: element.id,
              x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
            });
          }
        });

        const pageOkIndex = _.findIndex(this.pageNoWatcher, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex > -1) {
          templateToSave.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }
      });
      // console.log(templateToSave);

      // console.log("save template");
      const input = {
        templatePages: templateToSave,
        templateId:
          templateChoice == 1
            ? "TEMP" +
              "_" +
              templateTagName +
              "_" +
              this.type +
              "_" +
              Date.now().toString()
            : templateId,
        templateTagName,
        templateType: this.originType ? this.originType : this.type,
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        businessTitle: this.vendor.businessTitle,
      };
      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        this.$store.dispatch("saveTemplate", {
          input,
        });
        templateToSave = [];
      } else {
        this.$store.commit(
          "setError",
          "This size of template is over limit, please downsize photos or texts"
        );
        return;
      }
      // eventBus_saveTemplate.$off();
    });
  },

  beforeDestroy() {

    console.log("htmlConverter destroy");
    // eventBus_editElement.$off();
    // eventBus_addPage.$off();
    // eventBus_preview.$off();
    eventBus_saveSketch.$off();
    // eventBus_appendHook.$off();
    eventBus_saveTemplate.$off();
    eventBus_saveFlyer.$off();
  },

  watch: {
    borderLined(newVal) {
      if (this.editStatus && this.editId) {
        const currentPageIndex = _.findIndex(this.pageSave, (item) => {
          return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
        });
        const currentElement = document.querySelector("#" + this.editId);
        currentElement.style.borderStyle = newVal ? "dotted" : "none";
        const flyerElementOuter = currentElement.outerHTML;
        const flyerElementOuterStyle = currentElement.style.cssText;

        // console.log(flyerElementOuter);
        this.pageSave[currentPageIndex].flyerPageElements[
          this.editIndex
        ].htmlOuter = flyerElementOuter;
        this.pageSave[currentPageIndex].flyerPageElements[
          this.editIndex
        ].htmlOuterStyle = flyerElementOuterStyle;
        eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
      }
    },

    htmlInner(newVal, oldVal) {
      // console.log(newVal);
      if (newVal) {
        // console.log("good");
        const parser = new DOMParser();
        // console.log(this.editId);
        if (this.editId) {
          // console.log("edit");
          const currentElement = document.querySelector("#" + this.editId);
          currentElement.removeChild(
            document.querySelector("#" + this.editId).lastChild
          );
          const doc = parser.parseFromString(newVal, "text/html");
          // console.log(this.vendor);
          // console.log(doc.body);
          currentElement.appendChild(doc.body);
          const flyerElementOuter = currentElement.outerHTML;
          const flyerElementOuterStyle = currentElement.style.cssText;
          // console.log(flyerElementOuter);

          this.pageSave.map((page, index) => {
            if (page.nodeId == this.editPageId) {
              this.pageSave[index].flyerPageElements[
                this.editIndex
              ].htmlInner = newVal;
              this.pageSave[index].flyerPageElements[
                this.editIndex
              ].htmlOuter = flyerElementOuter;
              this.pageSave[index].flyerPageElements[
                this.editIndex
              ].htmlOuterStyle = flyerElementOuterStyle;

              // this.pageSave[index].flyerPageElements[
              //   this.editIndex
              // ].x = page.x
              // this.pageSave[index].flyerPageElements[
              //   this.editIndex
              // ].y = page.y;
              // this.pageSave[index].flyerPageElements[
              //   this.editIndex
              // ].w = page.w;
              // this.pageSave[index].flyerPageElements[
              //   this.editIndex
              // ].h = page.h;
            }
          });

          eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
        } else {
          const currentPageIndex = _.findIndex(this.pageSave, (item) => {
            return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
          });
          if (currentPageIndex > -1) {
            const element = document.querySelector(
              "#" +
                this.pageSave[currentPageIndex].flyerPageElements[
                  this.pageSave[currentPageIndex].flyerPageElements.length - 1
                ].id
            );
            // console.log(element);
            if (element.lastChild) {
              element.removeChild(element.lastChild);

              // console.log(newVal);

              const doc = parser.parseFromString(newVal, "text/html");
              // console.log(this.vendor);
              // console.log(doc.body);
              this.pageSave[currentPageIndex].flyerPageElements[
                this.pageSave[currentPageIndex].flyerPageElements.length - 1
              ].htmlInner = newVal;
              element.appendChild(doc.body);
              const flyerElementOuter = element.outerHTML;
              const flyerElementOuterStyle = element.style.cssText;
              // console.log(flyerElementOuter);
              this.pageSave[currentPageIndex].flyerPageElements[
                this.pageSave[currentPageIndex].flyerPageElements.length - 1
              ].htmlOuter = flyerElementOuter;
              this.pageSave[currentPageIndex].flyerPageElements[
                this.pageSave[currentPageIndex].flyerPageElements.length - 1
              ].htmlOuterStyle = flyerElementOuterStyle;

              // this.pageSave[currentPageIndex].flyerPageElements[
              //   this.pageSave[currentPageIndex].flyerPageElements.length - 1
              // ].x = element.x;
              // this.pageSave[currentPageIndex].flyerPageElements[
              //   this.pageSave[currentPageIndex].flyerPageElements.length - 1
              // ].y = element.y;
              // this.pageSave[currentPageIndex].flyerPageElements[
              //   this.pageSave[currentPageIndex].flyerPageElements.length - 1
              // ].w = element.w
              // this.pageSave[currentPageIndex].flyerPageElements[
              //   this.pageSave[currentPageIndex].flyerPageElements.length - 1
              // ].h = element.h;
              
              eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
              // console.log(this.pageSave);
            }
          }
        }
      }
    },

    pageNo(newVal, oldVal) {
      // console.log(newVal);
      // console.log(oldVal);
      if (this.pageNoWatcher.length >= oldVal) {
        const oldPage = document.getElementById(
          this.pageNoWatcher[oldVal - 1].pageId
        );
        // console.log(this.pageNoWatcher[oldVal - 1].pageId);
        // console.log(oldPage);
        if (oldPage) {
          const previewIndex = _.findIndex(this.preview, (item) => {
            return item.id == this.pageNoWatcher[oldVal - 1].pageId;
          });
          if (previewIndex > -1) {
            this.preview[previewIndex].previewString = oldPage.outerHTML;
            // console.log(this.preview);
            const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
              return item.nodeId == this.pageNoWatcher[oldVal - 1].pageId;
            });
            this.pageSave[pageSaveIndex].flyerPageElements.map(
              (element, index, array) => {
                const elementNode = document.getElementById(element.id);
                if (elementNode && element.htmlInner !== "") {
                  array[index].htmlInner = elementNode.innerHTML;
                  array[index].htmlOuter = elementNode.outerHTML;
                  array[index].htmlOuterStyle = elementNode.style.cssText;
                  array[index].x = element.x;
                  array[index].y = element.y;
                  array[index].w = element.w;
                  array[index].h = element.h;
                }
              }
            );
          }
          oldPage.style.display = "none";
          // console.log(oldPage);
        }

        const newPage = document.getElementById(
          this.pageNoWatcher[newVal - 1].pageId
        );
        // console.log(this.pageNoWatcher[newVal - 1].pageId);
        // console.log(newPage);
        if (newPage) {
          newPage.style.display = "";
          // console.log(newPage);
        }

        this.editStatus = false;
        this.editId = null;
        this.borderLined = true;

        eventBus_editElement.$emit("quitEdit", this.pageNoWatcher);
      }
    },

    pageSave(val){
      // console.log(val)
    },
  },

  computed: {
    ...mapGetters([
      "vendor",
      "simpleFlyer",
      "selectedSketch",
      "selectedTemplate",
    ]),

    checkType() {
      if (this.originType) {
        return this.originType !== "COUPON";
      } else {
        return this.type !== "COUPON";
      }
    },

     checkFlyerTitle() {
      if (this.flyerTitle.indexOf(":") > 0) {
        return "' : ' is not allowed"
      }
    },

    source() {
      if (this.selectedSketch) {
        return this.selectedSketch;
      }
      if (this.selectedTemplate) {
        return this.selectedTemplate;
      }
    },
  },

  methods: {
    addElement() {
      const elementAdded = [];
      elementAdded.push({
        id: this.businessTitle.replace(/\s/g, "") + "_" + Date.now().toString(),
        htmlOuterStyle: "",
        htmlOuter: "",
        htmlInner: "<p></p>",
        x: 0,
        y: 0,
        w: 100,
        h: 100
      });
      // this.tooltipOk = true;
      // console.log(elementAdded);
      if (this.pageSave.length == 0) {
        this.pageSave.push({
          flyerPageElements: elementAdded,
          nodeId: this.flyerTitle + "_" + Date.now().toString(),
        });
        this.pageNoWatcher.push({
          pageNo: this.pages,
          pageId: this.pageSave[this.pages - 1].nodeId,
        });
        this.preview.push({
          id: this.pageSave[this.pages - 1].nodeId,
          previewString: "",
        });
        this.flyerId =
          this.vendor.businessTitle.replace(/\s/g, "") +
          "_" +
          this.type +
          "_" + Date.now().toString()
          // moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
        // console.log(this.pageNoWatcher);
        this.$emit("addElement", this.pages);
        eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
      } else {
        const currentPageIndex = _.findIndex(this.pageSave, (item) => {
          return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
        });
        if (currentPageIndex > -1) {
          const element = this.pageSave[currentPageIndex].flyerPageElements;
          // console.log(element)
          if (element[element.length - 1].htmlOuter !== "") {
            this.pageSave[currentPageIndex].flyerPageElements.push({
              id: this.businessTitle.replace(/\s/g, "") + "_" + Date.now().toString(),
              htmlOuter: "",
              htmlOuterStyle: "",
              htmlInner: "<p></p>",
               x: 0,
                y: 0,
                w: 100,
                h: 100
            });
            eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
            // console.log(this.pageSave);
          }
          this.$emit("addElement", this.pages);
        }
      }
        // console.log(this.pageSave);

    },

    addPage() {
      this.pages++;
      const elementAdded = [];
      elementAdded.push({
        id: this.businessTitle.replace(/\s/g, "") + "_" + Date.now().toString(),
        htmlOuter: "",
        htmlOuterStyle: "",
        htmlInner: "<p></p>",
        x: 0,
        y: 0,
        w: 100,
        h: 100
      });
      this.pageSave.push({
        flyerPageElements: elementAdded,
        nodeId: this.flyerTitle + "_" + Date.now().toString(),
      });
      this.pageNoWatcher.push({
        pageNo: this.pages,
        pageId: this.pageSave[this.pageSave.length - 1].nodeId,
      });
      this.preview.push({
        id: this.pageSave[this.pageSave.length - 1].nodeId,
        previewString: "",
      });
      // console.log(this.pageNoWatcher);
      eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
      // console.log(this.pageSave);
      this.pageNo = this.pageNoWatcher.length;
      eventBus_addPage.$emit("addPage", this.pageNoWatcher);
    },

    changeBackgroundColor(eventValue) {
      // console.log(eventValue);
      if (this.firstColor) {
        this.color = this.flyerBackgroundColor;
        this.firstColor = false;
      } else {
        this.color = eventValue;
        this.flyerBackgroundColor = eventValue;
        // console.log(this.color);
        // console.log(this.flyerBackgroundColor);
      }
      // if (!this.flyerBackgroundColor) {
      //   this.flyerBackgroundColor = " ‎#FFFFFF";
      // }
      // console.log(this.color);
      // this.flyerBackgroundColor = this.color.hexa;
    },

    deleteElement() {
      // console.log(document.querySelector("#" + this.editId));
      // console.log(this.flyerPageElements);
      // console.log(this.editId);

      const currentPageIndex = _.findIndex(this.pageSave, (item) => {
        return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
      });
      document.querySelector("#" + this.editId).remove();

      // console.log(this.pageSave);
      this.pageSave[currentPageIndex].flyerPageElements[
        this.editIndex
      ].htmlInner = "";

      const parser = new DOMParser();
      this.pageSave[currentPageIndex].flyerPageElements.map((element) => {
        // console.log(element);
        if (element.htmlInner !== "") {
          const doc = parser.parseFromString(element.htmlInner, "text/html");
          const elementDom = document.querySelector("#" + element.id);
          // console.log(elementDom);
          // console.log(elementDom.lastElementChild);
          elementDom.removeChild(elementDom.lastElementChild);
          // console.log(elementDom);
          elementDom.appendChild(doc.body);
          // console.log(elementDom);
          this.zeroElement = false;
        }
      });
      // this.editStatus = false;
      eventBus_editElement.$emit("deleteElement", this.zeroElement);
    },

    deletePage() {
      const currentPage = document.getElementById(
        this.pageNoWatcher[this.pageNo - 1].pageId
      );
      if (currentPage) {
        currentPage.remove();
        const previewIndex = _.findIndex(this.preview, (item) => {
          return item.id == this.pageNoWatcher[this.pageNo - 1].pageId;
        });
        this.preview.splice(previewIndex, 1);
        const slicePos = this.pageNo - 1;
        // console.log(this.pageSave);
        this.pageNoWatcher.splice(slicePos, 1);

        // console.log(this.pageNoWatcher);
        for (let i = 1; i <= this.pageNoWatcher.length; i++) {
          this.pageNoWatcher[i - 1].pageNo = i;
        }

        this.pages--;

        if (this.pageNo === 1) {
          document.getElementById(this.pageNoWatcher[0].pageId).style.display =
            "";
          this.pageNo = 1;
        } else {
          this.pageNo--;
        }

        eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
      }
    },

    editClickElement(item, index, editPageId) {
      // console.log(item);
      if (this.editStatus) {
        this.editId = item.id;
        this.editIndex = index;
        this.editPageId = editPageId;
        // console.log(item.htmlInner);
         const pPos = item.htmlInner.indexOf("<body>");
         eventBus_editElement.$emit("editElement",  item.htmlInner);
          // if(pPos < 0) {
          //   eventBus_editElement.$emit("editElement", "<body>" + item.htmlInner + "</body>");
          // } else {
          //   const nodeInnerHtml = item.htmlInner.substr(pPos);
            

          // }
      }
    },

    itemClicked(pageIndex, itemIndex){
      // console.log(pageIndex)
      // console.log(itemIndex)
      this.pageIndex = pageIndex
      this.itemIndex = itemIndex
    },

    onResize(x, y, width, height) {
      // console.log(x)
      // console.log(y)
      // console.log(width)
      // console.log(height)
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].x = x
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].y = y
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].w = width
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].h = height
      // console.log(this.pageSave)
    },

    onDrag(x, y) {
      // console.log(x)
      // console.log(y)
      this.x = x;
      this.y = y;
      const w = this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].w
      const h = this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].h
       this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].x = x
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].y = y
       this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].w = w ? w : 100
      this.pageSave[this.pageIndex].flyerPageElements[this.itemIndex].h = h ? h : 100
      // console.log(this.pageSave)

    },

    quitEdit() {
      this.editStatus = false;
      this.editId = null;
      this.borderLined = true;

      eventBus_editElement.$emit("quitEdit", this.pageNoWatcher);
    },

    toEdit() {
      this.editStatus = true;
      eventBus_editElement.$emit("editElement");
    },
  },
  beforeRouteLeave(to, from, next) {
    next()
    // console.log("leave htmlconverter");
  },
};
</script>
<!-- <p>
      <br />
      X: {{ x }} / Y: {{ y }} - Width: {{ width }} / Height:
      {{ height }}
    </p> -->
<!-- <div
                v-for="item in simpleFlyer"
                :key="item.id + vendor.businessTitle"
                :id="item.id"
                class="ma-0 pa-0"
              >

              </div> -->
