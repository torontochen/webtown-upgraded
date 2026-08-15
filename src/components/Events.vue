<template>
    <v-card flat color="shade">
        <!-- <v-card-title>Events</v-card-title> -->
        <v-card-text>
            <v-row>
                <v-col cols="3" v-for="(event, i) in events" :key="i">
                <v-card   class="my-2 pa-1 rounded-lg" style="box-shadow: 0 12px 50px 2px #13507c24;">
                     <v-img :src="event.eventPhoto" contain max-height="400" max-width="400" class="ma-auto">
                            <img v-event-type-photo="event.eventType" width="100" height="80"  style="position: absolute; top: 10px; right: 0px;" />
                          </v-img>
                        <v-divider color="shade"></v-divider>
                          <v-card-text>
                        <v-card-subtitle class=" font-weight-bold accent--text text-center text--darken-1 text-h6">{{event.eventTitle}}</v-card-subtitle>
                        <p class="fontColor--text text--darken-1">{{event.eventInstruction}}</p>
                        </v-card-text>
                        <v-divider color="shade"></v-divider>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-card-subtitle class="text-caption">From: {{event.dateFrom | convert-date }}</v-card-subtitle>
                            <v-spacer></v-spacer>
                            <v-card-subtitle class="text-caption">To: {{event.dateTo | convert-date}}</v-card-subtitle>
                            <v-spacer></v-spacer>
                          
                          </v-card-actions>
                </v-card>
            </v-col>
            </v-row>
            
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "Events",
    props: ['events']
}
</script>

<style lang="scss" scoped>

.basil {
background-color: #FFFBE6 !important;
}

.basil--text {
color: #356859 !important;
}
</style>