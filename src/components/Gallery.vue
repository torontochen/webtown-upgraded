<template>
    <v-card flat color="shade" class="pa-2">
        <!-- show single photo -->
        <v-dialog v-model="singlePhotoPageOpen" width="700"  transition="fade">
            <v-card class="pa-5">
                <!-- <v-card-text> -->
                    <v-img
                        :src="singlePhotoPageUri"
                        :lazy-src="singlePhotoPageUri"
                        aspect-ratio="1">
                    </v-img>
                <!-- </v-card-text> -->
            </v-card>
        </v-dialog>

        <v-card-text>
            <v-row>
                <v-col
                v-for="(photo, i) in photoList"
                :key="i"
                class="d-flex child-flex"
                cols="4"
                >
                    <v-hover>
                        <template v-slot:default="{ isHovering: hover, props }">
                                <v-img v-bind="props"
                                :src="photo"
                                :lazy-src="photo"
                                aspect-ratio="1"
                                class="grey lighten-2 d-inline-block rounded-lg"
                            >
                             <!-- :src="`/${vendor}/${photo}`"
                                :lazy-src="`/${vendor}/${photo}`" -->
                                <v-fade-transition>
                                    <v-overlay
                                    :model-value="hover"
                                    contained
                                    color="#036358"
                                    class="d-flex justify-center align-center"
                                    >
                                    <!-- <v-row> -->
                                    <v-icon
                                    large
                                    color="white"
                                    class="mx-3"
                                    @click="showSinglePhoto(photo)">mdi-selection-search</v-icon>
                                    <!-- </v-row> -->
                                    </v-overlay>
                                </v-fade-transition>
                                </v-img>
                        </template>
                    </v-hover>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "Gallery",
    props: ['photoList', 'vendor'],
    data() {
        return {
            singlePhotoPageOpen: false,
            singlePhotoPageUri: ''
        }
    },
    methods: {
        showSinglePhoto(photoUri) {
            this.singlePhotoPageUri = photoUri
            this.singlePhotoPageOpen = true
        },
    }
}
</script>

    