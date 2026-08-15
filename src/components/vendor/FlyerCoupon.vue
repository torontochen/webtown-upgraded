<template>
  <v-container class="mt-n7">
    <v-container fluid>
        <!-- flyer Id and Title -->
          <v-card color="shade"   tile class="ma-2 ">
            <v-card-text>
              <v-row>
                <v-col
                  cols="6"
                >
                  <span class="text-subtitle-2 primary--text">
                    FLYERCOUPON in Design:{{flyerId}}
                    <!-- {{
                      originType !== "template" && origin !== "template"
                        ? flyerId
                        : "new"
                    }} -->
                  </span>
                  <!-- <h5 v-else>{{originType_C ? originType_C : type_C}} in Design:
                    {{originType_C && origin_C !== 'template' ? flyerId_C : 'new'}}</h5> -->
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    text
                    dense
                    v-model.trim="flyerTitle"
                    label="Title"
                    required
                    :rules="flyerTitleRules"
                    hint="' : ' is not allowed"
                    :error-messages="checkFlyerTitle"
                    class="mt-3"
                  >
                  </v-text-field>
                  <!-- <v-text-field
                    v-else
                    text
                    v-model.trim="flyerTitle_C"
                    label="Title"
                    required
                    :rules="flyerTitleRules_C"
                  >
                  </v-text-field> -->
                </v-col>
              </v-row>
            </v-card-text>
          <!-- </v-card> -->

        <!-- tool bar with all buttons -->
        </v-card>

          <v-toolbar flat dense color="shade3" class="ma-6 mt-0">
            <!-- color="rgba(122, 108, 203, 0.5)" -->
            <v-btn-toggle color="primary" dense group class="d-block ml-10">
              <!-- Add element -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-if="flyerOrCoupon == 'flyer'"
                    :value="1"
                    text
                    v-on="on"
                    @click="addElement"
                    :disabled="editStatus"
                  >
                    <v-icon>mdi-shape-polygon-plus</v-icon>
                  </v-btn>
                  <v-btn
                    v-else
                    :value="1"
                    text
                    v-on="on"
                    @click="addElement"
                    :disabled="editStatus_C"
                  >
                    <v-icon>mdi-shape-polygon-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add Element</span>
              </v-tooltip>

              <!-- Add Page -->
              <v-tooltip top v-if="flyerOrCoupon == 'flyer'">
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
              <v-tooltip top v-else>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :value="5"
                    text
                    v-on="on"
                    :disabled="editStatus_C || pageSave_C.length == 0"
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
                v-if="flyerOrCoupon == 'flyer'"
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
                  v-if="flyerOrCoupon == 'flyer'"
                  mode="hexa"
                  :value="color"
                  @input="changeBackgroundColor"
                ></v-color-picker>
              </v-menu>

              <v-menu
                v-else
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
                  v-if="flyerOrCoupon !== 'flyer'"
                  mode="hexa"
                  :value="color_C"
                  @input="changeBackgroundColor_C"
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
                    v-if="flyerOrCoupon == 'flyer'"
                    :value="3"
                    text
                    v-on="on"
                    :disabled="!editStatus || !editId"
                    @click="deleteElement"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn
                    v-else
                    :value="3"
                    text
                    v-on="on"
                    :disabled="!editStatus_C || !editId_C"
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
              v-if="flyerOrCoupon == 'flyer'"
              v-model="borderLined"
              class="d-block mt-5 mr-2"
              dense
              :label="borderLined ? 'Dotted Line' : 'None'"
              :disabled="!editStatus"
            ></v-switch>
            <v-switch
              v-else
              v-model="borderLined_C"
              class="d-block mt-5 mr-2"
              dense
              :label="borderLined_C ? 'Dotted Line' : 'None'"
              :disabled="!editStatus_C"
            ></v-switch>

               <v-spacer></v-spacer>
              <v-btn-toggle
                    v-model="flyerCoupon"
                    rounded
                    dense
                    dark
                    mandatory
                    :disabled="editStatus || editStatus_C"
                  >
                    <v-btn
                      x-small
                      @click="couponSwitchFlyer"
                      color="primary darken-5"
                    >
                      flyer
                    </v-btn>
                    <v-btn
                      x-small
                      @click="couponSwitchCoupon"
                      color="primary darken-5"
                    >
                      coupon
                    </v-btn>
              </v-btn-toggle>

            <v-tooltip v-if="editStatus || editStatus_C" top>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="quitEdit"
                  x-small
                  depressed
                  v-on="on"
                  color="primary"
                  outlined
                  class="d-block mx-2"
                >
                  Design
                </v-btn>
              </template>
              <span>Switch to design mode</span>
            </v-tooltip>
            <v-tooltip top v-else>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="flyerOrCoupon == 'flyer'"
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
                </v-btn>
                <v-btn
                  v-else
                  x-small
                  color="primary"
                  dark
                  depressed
                  class="d-block mx-2"
                  v-on="on"
                  @click="toEdit"
                  :disabled="pageNoWatcher_C.length == 0"
                >
                  Edit
                </v-btn>
              </template>
              <span> Switch to edit mode</span>
            </v-tooltip>
          </v-toolbar>
    </v-container>

    <!-- <v-row> -->
      <v-container class="ml-n3 px-n6">
        <v-row>
          <v-col cols="1">
            <v-tooltip left open-on-hover>
              <template v-slot:activator="{ on }">
                <v-slider
                  v-if="flyerOrCoupon == 'flyer'"
                  v-model="sliderV"
                  :max="maxSliderV"
                  :min="minSliderV"
                  vertical
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-9"
                  v-on="on"
                ></v-slider>
                <v-slider
                  v-else
                  v-model="sliderV_C"
                  :max="maxSliderV_C"
                  :min="minSliderV_C"
                  vertical
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-9"
                  v-on="on"
                ></v-slider>
              </template>
              <span
                >Flyer height is
                {{ flyerOrCoupon == "flyer" ? minSliderV : minSliderV_C }}px to
                {{
                  flyerOrCoupon == "flyer" ? maxSliderV : maxSliderV_C
                }}px</span
              >
            </v-tooltip>
          </v-col>
          <v-col cols="11">
            <v-tooltip top open-on-hover>
              <template v-slot:activator="{ on }">
                <v-slider
                  v-if="flyerOrCoupon == 'flyer'"
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
                <v-slider
                  v-else
                  v-model="sliderH_C"
                  :max="maxSliderH_C"
                  :min="minSliderH_C"
                  :thumb-size="22"
                  thumb-label="always"
                  class="d-block mt-n2 ml-n2"
                  open-on-hover
                  v-on="on"
                >
                </v-slider>
              </template>
              <span
                >Flyer width is
                {{ flyerOrCoupon == "flyer" ? minSliderH : minSliderH_C }}px to
                {{
                  flyerOrCoupon == "flyer" ? maxSliderH : maxSliderH_C
                }}px</span
              >
            </v-tooltip>

            <v-card
              v-show="flyerOrCoupon == 'flyer'"
              outlined
              hover
              :width="sliderH"
              :height="sliderV"
              class="ma-0, pa-0"
            >
              <!-- <v-container> -->
                <div
                  style="
                    border: 1px solid rgba(122, 108, 203, 0.5);
                    border-radius: 4px;
                    position: relative;
                    padding: 0;
                    margin: 0;
                  "
                  :style="{
                    backgroundColor: flyerBackgroundColor,
                    height: sliderV + 'px',
                    width: sliderH + 'px',
                  }"
                  v-for="(flyerPage, pageIndex) in pageSave"
                  v-show="pageSave.length > 0"
                  :key="pageIndex"
                  :id="flyerPage.nodeId"
                >
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
              <!-- </v-container> -->
            </v-card>
            <v-card
              v-show="flyerOrCoupon == 'coupon'"
              outlined
              hover
              :width="sliderH_C"
              :height="sliderV_C"
              class="ma-0 pa-0"
            >
              <!-- <v-row> -->
                <!-- style="
                     border: 1px solid rgba(122, 108, 203, 0.5);
                     border-radius: 4px;
                      position: relative;
                    " -->
                <div
                  :style="{
                    backgroundColor: flyerBackgroundColor_C,
                    height: sliderV_C + 'px',
                    width: sliderH_C + 'px',
                    border:
                      flyerOrCoupon == 'flyer'
                        ? '1px solid rgba(122, 108, 203, 0.5)'
                        : '3px dashed rgba(128, 131, 172, 1)',
                    borderRadius: '4px',
                    position: 'relative',
                  }"
                  v-for="(flyerPage_C, pageIndex_C) in pageSave_C"
                  v-show="pageSave_C.length > 0"
                  :key="pageIndex_C"
                  :id="flyerPage_C.nodeId"
                >
                  <v-img
                    :src="qrPic"
                    width="50"
                    height="50"
                    style="position: absolute; right: 3px; bottom: 3px"
                  ></v-img>
                    <!-- <v-icon
                    v-if="
                      (type && type !== 'FLYER') ||
                        (originType && originType !== 'FLYER')
                    "
                    style="position:absolute; right: 3px; bottom: 3px"
                    color="black"
                    size="72">mdi-qrcode</v-icon> -->
                    <!-- :style="item.htmlOuterStyle" -->

                  <vue-draggable-resizable
                    class="ma-0 pa-0"
                    v-for="(item, index) in flyerPage_C.flyerPageElements"
                    :key="index"
                    :id="item.id"
                     :w="item.w"
                    :h="item.h"
                    :x="item.x"
                    :y="item.y"
                    @dragging="onDrag_C"
                    @resizing="onResize_C"
                    @activated="itemClicked_C(pageIndex_C, index)"
                    style="borderStyle: 'none' "
                    @click.native="
                      editClickElement(item, index, flyerPage_C.nodeId)
                    "
                  >
                    <!-- :style="{ borderStyle: borderLined ? 'dotted' : 'none' }" -->
                  </vue-draggable-resizable>
                </div>
              <!-- </v-row> -->
            </v-card>

            <v-row>
              <v-col cols="10">
                <v-pagination
                  v-if="flyerOrCoupon == 'flyer'"
                  v-model="pageNo"
                  :length="pages"
                  total-visible="5"
                  class="mt-4 elevation-0"
                ></v-pagination>
                <v-pagination
                  v-else
                  v-model="pageNo_C"
                  :length="pages_C"
                  total-visible="5"
                  class="mt-4 elevation-0"
                ></v-pagination>
              </v-col>
              <v-col cols="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-if="flyerOrCoupon == 'flyer'"
                      v-on="on"
                      @click="deletePage"
                      text
                      class="d-clock mt-6"
                      :disabled="pages <= 1"
                    >
                      <v-icon color="primary">mdi-delete-circle</v-icon>
                    </v-btn>
                    <v-btn
                      v-else
                      v-on="on"
                      @click="deletePage"
                      text
                      class="d-clock mt-6"
                      :disabled="pages_C <= 1"
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
    <!-- </v-row> -->
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
  props: ["htmlInner"],
  data() {
    return {
      borderLined: true,
      borderLined_C: true,
      businessTitle: '',
      closeOnContentClick: false,
      closeOnContentClick_C: false,
      color: null,
      color_C: null,
      editPageId: "", // the page id under edit
      editId: null, // the element id under edit
      editIndex: null, // to indicate the index number of element under edit
      editStatus: false, // to indicate if it is under edit mode
      editPageId_C: "", // the page id under edit
      editId_C: null, // the element id under edit
      editIndex_C: null, // to indicate the index number of element under edit
      editStatus_C: false, // to indicate if it is under edit mode
      elementMounted: null,
      firstColor: true,
      firstColor_C: true,
      flyerTitleRules: [(title) => !!title || "The title is required"],
      flyerBackgroundColor: "#FFFFFF",
      flyerBackgroundColor_C: "#FFFFFF",
      flyerTitle: "My Flyer",
      flyerId: null,
      flyerCoupon: null,
      flyerOrCoupon: "flyer",
      itemIndex: null,
      itemIndex_C: null,
      origin: null, // from sketch or template
      originType: null,
      maxSliderH: 980,
      minSliderH: 200,
      maxSliderV: 720,
      minSliderV: 200,
      maxSliderH_C: 980,
      minSliderH_C: 200,
      maxSliderV_C: 720,
      minSliderV_C: 200,
      originType_C: null,
      pageNoWatcher_C: [], // to control the final updated pages in pagesave
      pageNo_C: 1, // the page no of pagination
      pages_C: 1,
      preview_C: [], // the array for preview
      pageNoWatcher: [], // to control the final updated pages in pagesave
      pageNo: 1, // the page no of pagination
      pages: 1,
      pageIndex: null,
      pageIndex_C: null,
      pageSave_C: [], // contain all data of pages in flyer including not available one for final rendering
      pageSave: [], // contain all data of pages in flyer including not available one for final rendering
      preview: [], // the array for preview
      qrPic:
        "data:image/png;base64,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",
      sliderH: 720,
      sliderV: 230,
      sliderH_C: 720,
      sliderV_C: 230,
      zeroElement: true, // to indicate if there is no any element on single page
      zeroElement_C: null, // to indicate if there is no any element on single page
    };
  },

  created() {
    // console.log("htmlconverter created");
    console.log(this.source)

    if (this.source) {
      console.log(this.source);
      const {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        backgroundColor_C,
        width,
        height,
        width_C,
        height_C,
        origin,
      } = this.source;
      this.pageSave = sketchPages;
      this.pageSave_C = sketchPages_C;
      if (origin !== "template") {
        this.flyerId = flyerId;
        this.flyerTitle = flyerTitle;
      } else {
        this.flyerId =
          this.vendor.businessTitle.replace(/\s/g, "") +
          "_" +
          "FLYERCOUPON" +
          "_" + Date.now().toString()
          // moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
      }
      this.originType = type;
      this.$store.commit("setFlyerFormatType", type);
      // console.log(type);
      this.flyerBackgroundColor = backgroundColor;
      this.sliderH = width;
      this.sliderV = height;
      this.flyerBackgroundColor_C = backgroundColor_C;
      this.sliderH_C = width_C;
      this.sliderV_C = height_C;
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

      // Initialize Coupon PageSave
      const revisedPageSave_C = this.pageSave_C.map(
        (item, index, pageArray) => {
          const pageNode_C = document.getElementById(item.nodeId);
          // console.log(pageNode_C);
          // if (this.originType !== "FLYER") {
          const QR = `<body><P><img
                    src=${this.qrPic}
                    style="width: 50px; height: 50px; position:absolute; right: 3px; bottom: 3px"
                  ></img></P></body>`;
                    // const QR = `  <v-icon
                    // style="position:absolute; right: 3px; bottom: 3px"
                    // color="black"
                    // size="72">mdi-qrcode</v-icon>` 
          const qrDoc = parser.parseFromString(QR, "text/html");
          // console.log(qrDoc.body);
          pageNode_C.appendChild(qrDoc.body);
          // }

          const revisedElements_C = item.flyerPageElements.map(
            (elementItem, index, array) => {
              // console.log(elementItem.htmlOuter);

              // console.log(array);
              const elementNode_C = document.getElementById(elementItem.id);
              const decompressedInner_C = LZString.decompress(
                elementItem.htmlInner,
                { inputEncoding: "Base64" }
              );
              const doc_C = parser.parseFromString(
                decompressedInner_C,
                "text/html"
              );
              // console.log(doc.body);
              elementNode_C.appendChild(doc_C.body);
              elementNode_C.style = elementItem.htmlOuterStyle;
              const pPos_C = decompressedInner_C.indexOf("<p>");
              const nodeInnerHtml_C = decompressedInner_C.substr(pPos_C);
              // console.log(nodeInnerHtml);
              // console.log(elementNode.innerHTML);
              array[index].htmlInner = "<body>" + nodeInnerHtml_C;
              array[index].htmlOuter = elementNode_C.outerHTML;
              array[index].htmlOuterStyle = elementNode_C.style.cssText;
              array[index].x = elementItem.x;
              array[index].y = elementItem.y;
              array[index].w = elementItem.w;
              array[index].h = elementItem.h;
              return {
                id: elementItem.id,
                htmlInner: "<body>" + nodeInnerHtml_C,
                htmlOuter: elementNode_C.outerHTML,
                htmlOuterStyle: elementNode_C.style.cssText,
                x: elementItem.x,
                y: elementItem.y,
                w: elementItem.w,
                h: elementItem.h
              };
              // _.omit(elementItem, ["_typename"]);
            }
          );

          this.preview_C.push({
            id: item.nodeId,
            previewString: pageNode_C.outerHTML,
          });
          if (index !== 0) {
            pageNode_C.style.display = "none";
          }
          this.pageNoWatcher_C.push({
            pageNo: index + 1,
            pageId: item.nodeId,
          });

          // _.omit(item, ["_typename"]);
          return {
            nodeId: item.nodeId,
            flyerPageElements: revisedElements_C,
          };
        }
      );
      // console.log(revisedPageSave);
      this.pageSave_C = revisedPageSave_C;
      // console.log(this.pageSave_C);
      this.pages_C = this.pageSave_C.length;
      this.pageNo_C = 1;
      this.elementMounted = true;
    } else {
      // this.flyerId =
      //   this.vendor.businessTitle.replace(/\s/g, "") +
      //   "_" +
      //   "FLYERCOUPON" +
      //   "_" + Date.now().toString()
        // moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a");
    }

    // Do Preview
    eventBus_preview.$on("doPreview", (eventValue) => {
      if (this.flyerOrCoupon == "flyer") {
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
          }
        }
        this.$store.commit("clearPagePreview");
        this.$store.commit("setPagePreview", this.preview);
        this.$store.commit("clearPagePreview_C");
        this.$store.commit("setPagePreview_C", this.preview_C);
      } else {
        // console.log(this.preview_C);
        // console.log(this.pageNoWatcher_C);
        // console.log(this.pageNo_C);
        const previewIndex_C = _.findIndex(this.preview_C, (item) => {
          return item.id == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
        });
        // console.log(previewIndex_C);
        if (previewIndex_C > -1) {
          // console.log(
          //   document.getElementById(
          //     this.pageNoWatcher_C[this.pageNo_C - 1].pageId
          //   )
          // );
          if (
            document.getElementById(
              this.pageNoWatcher_C[this.pageNo_C - 1].pageId
            )
          ) {
            this.preview_C[
              previewIndex_C
            ].previewString = document.getElementById(
              this.pageNoWatcher_C[this.pageNo_C - 1].pageId
            ).outerHTML;
          }
        }
        this.$store.commit("clearPagePreview_C");
        this.$store.commit("setPagePreview_C", this.preview_C);
        this.$store.commit("clearPagePreview");
        this.$store.commit("setPagePreview", this.preview);
      }
    });

    //Save Sketch
    eventBus_saveSketch.$on("saveSketch_C", () => {
      console.log("save sketch at start");
      this.$store.commit("clearError");
      // console.log(this.flyerId);
      if (this.flyerOrCoupon == "flyer") {
        const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
          // console.log(item);
          return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
        });
        // console.log(this.pageNoWatcher);
        // console.log(this.pageSave);
        // console.log(this.pageSave[pageSaveIndex]);
        this.pageSave[pageSaveIndex].flyerPageElements.map(
          (elementItem, index, array) => {
            const elementNode = document.getElementById(elementItem.id);
            if (elementNode && elementItem.htmlInner !== "") {
              array[index].htmlInner = elementNode.innerHTML;
              array[index].htmlOuter = elementNode.outerHTML;
              array[index].htmlOuterStyle = elementNode.style.cssText;
              array[index].x = elementItem.x;
              array[index].y = elementItem.y;
              array[index].w = elementItem.w;
              array[index].h = elementItem.h;
            }
          }
        );
      } else {
        const pageSaveIndex_C = _.findIndex(this.pageSave_C, (item) => {
          // console.log(item);
          return item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
        });
        // console.log(this.pageNoWatcher);
        // console.log(this.pageSave);
        // console.log(this.pageSave[pageSaveIndex]);
        this.pageSave_C[pageSaveIndex_C].flyerPageElements.map(
          (elementItem, index, array) => {
            const elementNode_C = document.getElementById(elementItem.id);
            if (elementNode_C && elementItem.htmlInner !== "") {
              array[index].htmlInner = elementNode_C.innerHTML;
              array[index].htmlOuter = elementNode_C.outerHTML;
              array[index].htmlOuterStyle = elementNode_C.style.cssText;
              array[index].x = elementItem.x;
              array[index].y = elementItem.y;
              array[index].w = elementItem.w;
              array[index].h = elementItem.h;
            }
          }
        );
      }

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
          sketchToSave.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }
      });

      let sketchToSave_C = [];
      this.pageSave_C.map((pageSaveItem, index, toSaveArray) => {
        // console.log(pageSaveItem);
        let flyerPageElementsToSave_C = [];
        pageSaveItem.flyerPageElements.map((element, elementIndex) => {
          if (element.htmlInner !== "") {
            flyerPageElementsToSave_C.push({
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

        const pageOkIndex_C = _.findIndex(this.pageNoWatcher_C, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex_C > -1) {
          sketchToSave_C.push({
            flyerPageElements: flyerPageElementsToSave_C,
            nodeId: pageSaveItem.nodeId,
          });
        }
      });
      // console.log(sketchToSave);
      const input = {
        sketchPages: sketchToSave,
        sketchPages_C: sketchToSave_C,
        flyerId: this.flyerId,
        flyerTitle: this.flyerTitle,
        type: "FLYERCOUPON",
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        backgroundColor_C: this.flyerBackgroundColor_C,
        width_C: this.sliderH_C,
        height_C: this.sliderV_C,
        businessTitle: this.vendor.businessTitle,
      };
      // console.log("save sketch");
      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        this.$store.dispatch("saveSketch", {
          input,
        });
        sketchToSave = [];
        sketchToSave_C = [];
        this.$store.commit("clearSelectedSketch");
        this.$store.commit("clearSelectedSketch_C");
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
    eventBus_saveFlyer.$on("saveFlyer_C", () => {
      console.log("save flyer at start");
      this.$store.commit("clearError");
      if (this.flyerOrCoupon == "flyer") {
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
      } else {
        // console.log(this.flyerId);
        const pageSaveIndex_C = _.findIndex(this.pageSave_C, (item) => {
          // console.log(item);
          return item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
        });
        // console.log(this.pageNoWatcher);
        // console.log(this.pageSave);
        // console.log(this.pageSave[pageSaveIndex]);
        this.pageSave_C[pageSaveIndex_C].flyerPageElements.map(
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
              x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
              id: element.id,
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
      });

      let flyerToSave_C = [];
      this.pageSave_C.map((pageSaveItem, index, toSaveArray) => {
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

        const pageOkIndex_C = _.findIndex(this.pageNoWatcher_C, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex_C > -1) {
          flyerToSave_C.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }

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
          this.preview_C[index].previewString = pageNodeToSave.outerHTML
          this.preview_C[index].id = pageSaveItem.nodeId
          this.$store.commit("clearPagePreview_C");
          this.$store.commit("setPagePreview_C", this.preview_C)
      });
      // console.log(flyerToSave);

      console.log("save flyer");
      const input = {
        sketchPages: flyerToSave,
        sketchPages_C: flyerToSave_C,
        flyerId: this.flyerId,
        flyerTitle: this.flyerTitle,
        type: "FLYERCOUPON",
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        backgroundColor_C: this.flyerBackgroundColor_C,
        width_C: this.sliderH_C,
        height_C: this.sliderV_C,
        businessTitle: this.vendor.businessTitle,
        couponPages: this.preview_C,
        flyerPage_C: this.preview,
      };

      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        this.$store.dispatch("saveFlyer", {
          input,
        });
        flyerToSave = [];
        flyerToSave_C = [];
      } else {
        this.$store.commit(
          "setError",
          "This size of flyer is over limit, please downsize photos or texts"
        );
        return;
      }
    });

    // Save Template
    eventBus_saveTemplate.$on("saveTemplate_C", (eventValue) => {
      console.log("save template at start");
      this.$store.commit("clearError");
      // console.log(this.flyerId);
      const { templateChoice, templateId, templateTagName } = eventValue;
      if (this.flyerOrCoupon == "flyer") {
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
      } else {
        const pageSaveIndex_C = _.findIndex(this.pageSave_C, (item) => {
          // console.log(item);
          return item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
        });
        // console.log(this.pageNoWatcher);
        // console.log(this.pageSave);
        // console.log(this.pageSave[pageSaveIndex]);
        this.pageSave_C[pageSaveIndex_C].flyerPageElements.map(
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
              x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
              id: element.id,
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

      let templateToSave_C = [];
      this.pageSave_C.map((pageSaveItem, index, toSaveArray) => {
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

        const pageOkIndex_C = _.findIndex(this.pageNoWatcher_C, (item) => {
          return pageSaveItem.nodeId == item.pageId;
        });
        // console.log(pageOkIndex);
        if (pageOkIndex_C > -1) {
          templateToSave_C.push({
            flyerPageElements: flyerPageElementsToSave,
            nodeId: pageSaveItem.nodeId,
          });
        }
      });
      // console.log(sketchToSave);
      const input = {
        templatePages: templateToSave,
        templatePages_C: templateToSave_C,
        templateId:
          templateChoice == 1
            ? "TEMP" +
              "_" +
              templateTagName +
              "_" +
              "FLYERCOUPON" +
              "_" +
              Date.now().toString()
            : templateId,
        templateTagName,
        templateType: "FLYERCOUPON",
        backgroundColor: this.flyerBackgroundColor,
        width: this.sliderH,
        height: this.sliderV,
        backgroundColor_C: this.flyerBackgroundColor_C,
        width_C: this.sliderH_C,
        height_C: this.sliderV_C,
        businessTitle: this.vendor.businessTitle,
      };
      // console.log("save template");

      if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
        this.$store.dispatch("saveTemplate", {
          input,
        });
        templateToSave = [];
        templateToSave_C = [];
      } else {
        this.$store.commit(
          "setError",
          "This size of template is over limit, please downsize photos or texts"
        );
        return;
      }
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
    // color(newColor) {
    //   console.log('color: ' + newColor.hexa)
    // },
    // color_C(newColor){
    //   console.log('color_c: '+ newColor.hexa)
    // },
    borderLined(newVal) {
      if (this.flyerOrCoupon == "flyer") {
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
    }
    },

    borderLined_C(newVal) {
      if (this.flyerOrCoupon != "flyer") {
        if (this.editStatus_C && this.editId_C) {
          const currentPageIndex_C = _.findIndex(this.pageSave_C, (item) => {
            return (
              item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId
            );
          });
          const currentElement_C = document.querySelector("#" + this.editId_C);
          currentElement_C.style.borderStyle = newVal ? "dotted" : "none";
          const flyerElementOuter_C = currentElement_C.outerHTML;
          const flyerElementOuterStyle_C = currentElement_C.style.cssText;

          // console.log(flyerElementOuter);
          this.pageSave_C[currentPageIndex_C].flyerPageElements[
            this.editIndex_C
          ].htmlOuter = flyerElementOuter_C;
          this.pageSave_C[currentPageIndex_C].flyerPageElements[
            this.editIndex_C
          ].htmlOuterStyle = flyerElementOuterStyle_C;
          eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
        }
      }
    },

    elementMounted(newVal) {
      if (newVal) {
        eventBus_appendHook.$emit("elementMounted", newVal);
      }
    },

    flyerOrCoupon(newValue) {
      // console.log(newValue);
    },

    flyerId(val){
      console.log(val)
    },

    htmlInner(newVal, oldVal) {
      // console.log(newVal);
      if (this.flyerOrCoupon == "flyer") {
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
                eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
                // console.log(this.flyerPageElements);
              }
            }
          }
        }
      } else {
        if (newVal) {
          // console.log("good");
          const parser = new DOMParser();
          // console.log(this.editId_C);
          if (this.editId_C) {
            // console.log("edit");
            const currentElement_C = document.querySelector(
              "#" + this.editId_C
            );
            currentElement_C.removeChild(
              document.querySelector("#" + this.editId_C).lastChild
            );
            const doc_C = parser.parseFromString(newVal, "text/html");
            // console.log(this.vendor);
            // console.log(doc.body);
            currentElement_C.appendChild(doc_C.body);
            const flyerElementOuter_C = currentElement_C.outerHTML;
            const flyerElementOuterStyle_C = currentElement_C.style.cssText;
            // console.log(flyerElementOuter);

            this.pageSave_C.map((page, index) => {
              if (page.nodeId == this.editPageId_C) {
                this.pageSave_C[index].flyerPageElements[
                  this.editIndex_C
                ].htmlInner = newVal;
                this.pageSave_C[index].flyerPageElements[
                  this.editIndex_C
                ].htmlOuter = flyerElementOuter_C;
                this.pageSave_C[index].flyerPageElements[
                  this.editIndex_C
                ].htmlOuterStyle = flyerElementOuterStyle_C;
              }
            });

            eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
          } else {
            const currentPageIndex_C = _.findIndex(this.pageSave_C, (item) => {
              return (
                item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId
              );
            });
            if (currentPageIndex_C > -1) {
              const element_C = document.querySelector(
                "#" +
                  this.pageSave_C[currentPageIndex_C].flyerPageElements[
                    this.pageSave_C[currentPageIndex_C].flyerPageElements
                      .length - 1
                  ].id
              );
              // console.log(element);
              if (element_C.lastChild) {
                element_C.removeChild(element_C.lastChild);

                // console.log(newVal);

                const doc_C = parser.parseFromString(newVal, "text/html");
                // console.log(this.vendor);
                // console.log(doc.body);
                this.pageSave_C[currentPageIndex_C].flyerPageElements[
                  this.pageSave_C[currentPageIndex_C].flyerPageElements.length -
                    1
                ].htmlInner = newVal;
                element_C.appendChild(doc_C.body);
                const flyerElementOuter_C = element_C.outerHTML;
                const flyerElementOuterStyle_C = element_C.style.cssText;
                // console.log(flyerElementOuter);
                this.pageSave_C[currentPageIndex_C].flyerPageElements[
                  this.pageSave_C[currentPageIndex_C].flyerPageElements.length -
                    1
                ].htmlOuter = flyerElementOuter_C;
                this.pageSave_C[currentPageIndex_C].flyerPageElements[
                  this.pageSave_C[currentPageIndex_C].flyerPageElements.length -
                    1
                ].htmlOuterStyle = flyerElementOuterStyle_C;
                eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
                // console.log(this.flyerPageElements);
              }
            }
          }
        }
      }
    },

    pageNo(newVal, oldVal) {
      // console.log(newVal);
      // console.log(oldVal);
      if (this.flyerOrCoupon == "flyer") {
        let oldPage;
        if (this.pageNoWatcher.length >= oldVal) {
          oldPage = document.getElementById(
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
      }
    },

    pageNo_C(newVal, oldVal) {
      // console.log(newVal);
      // console.log(oldVal);
      if (this.flyerOrCoupon !== "flyer") {
        if (this.pageNoWatcher_C.length >= oldVal) {
          const oldPage_C = document.getElementById(
            this.pageNoWatcher_C[oldVal - 1].pageId
          );
          // console.log(this.pageNoWatcher[oldVal - 1].pageId);
          // console.log(oldPage);
          if (oldPage_C) {
            const previewIndex_C = _.findIndex(this.preview_C, (item) => {
              return item.id == this.pageNoWatcher_C[oldVal - 1].pageId;
            });
            if (previewIndex_C > -1) {
              this.preview_C[previewIndex_C].previewString =
                oldPage_C.outerHTML;
              // console.log(this.preview);
              const pageSaveIndex_C = _.findIndex(this.pageSave_C, (item) => {
                return item.nodeId == this.pageNoWatcher_C[oldVal - 1].pageId;
              });
              this.pageSave_C[pageSaveIndex_C].flyerPageElements.map(
                (element, index, array) => {
                  const elementNode_C = document.getElementById(element.id);
                  if (elementNode_C && element.htmlInner !== "") {
                    array[index].htmlInner = elementNode_C.innerHTML;
                    array[index].htmlOuter = elementNode_C.outerHTML;
                    array[index].htmlOuterStyle = elementNode_C.style.cssText;
                    array[index].x = element.x;
                    array[index].y = element.y;
                    array[index].w = element.w;
                    array[index].h = element.h;
                  }
                }
              );
            }
            oldPage_C.style.display = "none";
            // console.log(oldPage_C);
          }

          const newPage = document.getElementById(
            this.pageNoWatcher_C[newVal - 1].pageId
          );
          // console.log(this.pageNoWatcher[newVal - 1].pageId);
          // console.log(newPage);
          if (newPage) {
            newPage.style.display = "";
            // console.log(newPage);
          }

          this.editStatus_C = false;
          this.editId_C = null;
          this.borderLined_C = true;

          eventBus_editElement.$emit("quitEdit_C", this.pageNoWatcher_C);
        }
      }
    },
  },

  computed: {
    ...mapGetters([
      "vendor",
      "simpleFlyer",
      "selectedSketch_C",
      "selectedTemplate_C",
    ]),

    checkFlyerTitle() {
      if (this.flyerTitle.indexOf(":") > 0) {
        return "' : ' is not allowed"
      }
    },
    source() {
      if (this.selectedSketch_C) {
        return this.selectedSketch_C;
      }
      if (this.selectedTemplate_C) {
        return this.selectedTemplate_C;
      }
      return false;
    },
  },

  methods: {
    addElement() {
      if (this.flyerOrCoupon == "flyer") {
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
        // console.log(this.pageSave);
        if (this.pageSave.length == 0) {
          this.pageSave.push({
            flyerPageElements: elementAdded,
            nodeId: this.flyerTitle + "_" + Date.now().toString(),
          });
          // console.log(this.pageSave);
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
          "FLYERCOUPON" +
          "_" + Date.now().toString()
          // console.log(this.pageNoWatcher);
          this.$emit("addElement", this.pages);
          eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
        } else {
          const currentPageIndex = _.findIndex(this.pageSave, (item) => {
            return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
          });
          if (currentPageIndex > -1) {
            const element = this.pageSave[currentPageIndex].flyerPageElements;
            if (element[element.length - 1].htmlOuter !== "") {
              this.pageSave[currentPageIndex].flyerPageElements.push({
                id: this.businessTitle + "_" + Date.now().toString(),
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
      } else {
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
        // console.log(this.pageSave);
        if (this.pageSave_C.length == 0) {
          this.pageSave_C.push({
            flyerPageElements: elementAdded,
            nodeId: this.flyerTitle + "_" + Date.now().toString(),
          });
          // console.log(this.pageSave);
          this.pageNoWatcher_C.push({
            pageNo: this.pages_C,
            pageId: this.pageSave_C[this.pages_C - 1].nodeId,
          });
          this.preview_C.push({
            id: this.pageSave_C[this.pages_C - 1].nodeId,
            previewString: "",
          });

          // console.log(this.pageNoWatcher);
          this.$emit("addElement_C", this.pages_C);
          eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
        } else {
          const currentPageIndex_C = _.findIndex(this.pageSave_C, (item) => {
            return (
              item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId
            );
          });
          if (currentPageIndex_C > -1) {
            const element = this.pageSave_C[currentPageIndex_C]
              .flyerPageElements;
            if (element[element.length - 1].htmlOuter !== "") {
              this.pageSave_C[currentPageIndex_C].flyerPageElements.push({
                id: this.businessTitle + "_" + Date.now().toString(),
                htmlOuter: "",
                htmlOuterStyle: "",
                htmlInner: "<p></p>",
                x: 0,
                y: 0,
                w: 100,
                h: 100
              });
              eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
              // console.log(this.pageSave);
            }
            this.$emit("addElement_C", this.pages_C);
          }
        }
      }
    },

    addPage() {
      if (this.flyerOrCoupon == "flyer") {
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
      } else {
        this.pages_C++;
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
        this.pageSave_C.push({
          flyerPageElements: elementAdded,
          nodeId: this.flyerTitle + "_" + Date.now().toString(),
        });
        this.pageNoWatcher_C.push({
          pageNo: this.pages_C,
          pageId: this.pageSave_C[this.pageSave_C.length - 1].nodeId,
        });
        this.preview_C.push({
          id: this.pageSave_C[this.pageSave_C.length - 1].nodeId,
          previewString: "",
        });
        // console.log(this.pageNoWatcher);
        eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
        // console.log(this.pageSave_C);
        this.pageNo_C = this.pageNoWatcher_C.length;
        eventBus_addPage.$emit("addPage_C", this.pageNoWatcher_C);
      }
    },

    changeBackgroundColor(eventValue) {
      // console.log(eventValue)
      if (this.firstColor) {
        this.color = this.flyerBackgroundColor;
        this.firstColor = false;
      } else {
        this.color = eventValue;
        this.flyerBackgroundColor = eventValue;
        // console.log(this.color);
        // console.log(this.flyerBackgroundColor);
      }
    },

    changeBackgroundColor_C(eventValue) {
      if (this.firstColor_C) {
        this.color_C = this.flyerBackgroundColor_C;
        this.firstColor_C = false;
      } else {
        // console.log(this.flyerBackgroundColor_C);
        this.color_C = eventValue;
        this.flyerBackgroundColor_C = eventValue;
        // console.log(this.flyerBackgroundColor_C);
      }
    },

    couponSwitchFlyer() {
      // console.log("switch");
      if (this.flyerOrCoupon == "coupon" && this.pageNoWatcher_C.length > 0) {
        const oldPage = document.getElementById(
          this.pageNoWatcher_C[this.pageNo_C - 1].pageId
        );
        // console.log(this.pageNoWatcher[oldVal - 1].pageId);
        // console.log(oldPage);
        if (oldPage) {
          const previewIndex = _.findIndex(this.preview_C, (item) => {
            return item.id == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
          });
          if (previewIndex > -1) {
            this.preview_C[previewIndex].previewString = oldPage.outerHTML;
            // console.log(this.preview);
            const pageSaveIndex = _.findIndex(this.pageSave_C, (item) => {
              return (
                item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId
              );
            });
            this.pageSave_C[pageSaveIndex].flyerPageElements.map(
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
        }
      }
      this.flyerOrCoupon = "flyer";
    },

    couponSwitchCoupon() {
      // console.log("switch");
      if (this.flyerOrCoupon == "flyer" && this.pageNoWatcher.length > 0) {
        let oldPage = document.getElementById(
          this.pageNoWatcher[this.pageNo - 1].pageId
        );
        // console.log(this.pageNoWatcher[oldVal - 1].pageId);
        // console.log(oldPage);
        if (oldPage) {
          const previewIndex = _.findIndex(this.preview, (item) => {
            return item.id == this.pageNoWatcher[this.pageNo - 1].pageId;
          });
          if (previewIndex > -1) {
            this.preview[previewIndex].previewString = oldPage.outerHTML;
            // console.log(this.preview);
            const pageSaveIndex = _.findIndex(this.pageSave, (item) => {
              return item.nodeId == this.pageNoWatcher[this.pageNo - 1].pageId;
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
        }
      }
      this.flyerOrCoupon = "coupon";
    },

    deleteElement() {
      // console.log(document.querySelector("#" + this.editId));
      // console.log(this.flyerPageElements);
      // console.log(this.editId);
      if (this.flyerOrCoupon == "flyer") {
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
      } else {
        const currentPageIndex = _.findIndex(this.pageSave_C, (item) => {
          return item.nodeId == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
        });
        document.querySelector("#" + this.editId_C).remove();

        // console.log(this.pageSave);
        this.pageSave_C[currentPageIndex].flyerPageElements[
          this.editIndex_C
        ].htmlInner = "";

        const parser = new DOMParser();
        this.pageSave_C[currentPageIndex].flyerPageElements.map((element) => {
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
            this.zeroElement_C = false;
          }
        });
        // this.editStatus = false;
        eventBus_editElement.$emit("deleteElement_C", this.zeroElement_C);
      }
    },

    deletePage() {
      if (this.flyerOrCoupon == "flyer") {
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
            document.getElementById(
              this.pageNoWatcher[0].pageId
            ).style.display = "";
            this.pageNo = 1;
          } else {
            this.pageNo--;
          }

          eventBus_appendHook.$emit("appendHook", this.pageNoWatcher);
        }
      } else {
        const currentPage = document.getElementById(
          this.pageNoWatcher_C[this.pageNo_C - 1].pageId
        );
        if (currentPage) {
          currentPage.remove();
          const previewIndex = _.findIndex(this.preview_C, (item) => {
            return item.id == this.pageNoWatcher_C[this.pageNo_C - 1].pageId;
          });
          this.preview_C.splice(previewIndex, 1);
          const slicePos = this.pageNo_C - 1;
          // console.log(this.pageSave);
          this.pageNoWatcher_C.splice(slicePos, 1);

          // console.log(this.pageNoWatcher);
          for (let i = 1; i <= this.pageNoWatcher_C.length; i++) {
            this.pageNoWatcher_C[i - 1].pageNo_C = i;
          }

          this.pages_C--;

          if (this.pageNo_C === 1) {
            document.getElementById(
              this.pageNoWatcher_C[0].pageId
            ).style.display = "";
            this.pageNo_C = 1;
          } else {
            this.pageNo_C--;
          }

          eventBus_appendHook.$emit("appendHook_C", this.pageNoWatcher_C);
        }
      }
    },

    editClickElement(item, index, editPageId) {
      // console.log(item);
      if (this.flyerOrCoupon == "flyer") {
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
          //   eventBus_editElement.$emit("editElement", "<body>" + nodeInnerHtml);

          // }
          
          // console.log(nodeInnerHtml);
          // console.log(elementNode.innerHTML);
          
        }
      } else {
        if (this.editStatus_C) {
          this.editId_C = item.id;
          this.editIndex_C = index;
          this.editPageId_C = editPageId;
          // console.log(item.htmlInner);
           const pPos = item.htmlInner.indexOf("<body>");
           eventBus_editElement.$emit("editElement",  item.htmlInner);
          // if(pPos < 0) {
          //   eventBus_editElement.$emit("editElement", "<body>" + item.htmlInner + "</body>");
          // } else {
          //   const nodeInnerHtml = item.htmlInner.substr(pPos);
          //   eventBus_editElement.$emit("editElement", "<body>" + nodeInnerHtml);

          // }
        }
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
      console.log(this.pageSave)
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
    itemClicked_C(pageIndex_C, itemIndex_C){
      // console.log(pageIndex)
      // console.log(itemIndex)
      this.pageIndex_C = pageIndex_C
      this.itemIndex_C = itemIndex_C
    },

   onResize_C(x, y, width, height) {
      // console.log(x)
      // console.log(y)
      // console.log(width)
      // console.log(height)
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].x = x
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].y = y
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].w = width
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].h = height
      // console.log(this.pageSave_C)
    },

    onDrag_C(x, y) {
      // console.log(x)
      // console.log(y)
      this.x = x;
      this.y = y;
      const w = this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].w
      const h = this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].h
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].x = x
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].y = y
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].w = w ? w : 100
      this.pageSave_C[this.pageIndex_C].flyerPageElements[this.itemIndex_C].h = h ? h : 100
      // console.log(this.pageSave_C)

    },

    quitEdit() {
      if (this.flyerOrCoupon == "flyer") {
        this.editStatus = false;
        this.editId = null;
        this.borderLined = true;

        eventBus_editElement.$emit("quitEdit", this.pageNoWatcher);
      } else {
        this.editStatus_C = false;
        this.editId_C = null;
        this.borderLined_C = true;

        eventBus_editElement.$emit("quitEdit_C", this.pageNoWatcher_C);
      }
    },

    toEdit() {
      if (this.flyerOrCoupon == "flyer") {
        this.editStatus = true;
        eventBus_editElement.$emit("editElement");
      } else {
        this.editStatus_C = true;
        eventBus_editElement.$emit("editElement");
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    console.log("leave htmlconverter");
    next()
  },
};
</script>
