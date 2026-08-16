<template>
  <v-container fluid class="mb-10">
     <!-- <v-img src="https://www.animatedimages.org/data/media/100/animated-money-image-0013.gif" 
  height="80" width="100" contain v-show="false" />
    <v-img src="https://www.animatedimages.org/data/media/1353/animated-medal-image-0013.gif" 
                      height="80" width="100" contain v-show="false"/> -->
   

    <v-row justify="center" class="mb-6" >
    <!-- General Info -->
      <v-col cols="2">
        <v-sheet
        dark
        color="accent lighten-2"
        elevation="10"
        :height="viewPortDimension.height*0.11"
        class="pa-4 mr-5"
        rounded="lg"
        >
          <span class="text-h6 font-weight-bold d-block text-center">Treasure</span><br>
          <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="yellow">mdi-coin</v-icon>&nbsp;&nbsp;Gold: {{ $filters.formatIntAmount(resident.goldCoins) }}</span><br>
          <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-coin</v-icon>&nbsp;&nbsp;Silver: {{ $filters.formatIntAmount(resident.silverCoins) }}</span><br>
          <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-cash</v-icon>&nbsp;&nbsp;Property Tax: {{ $filters.formatIntAmount(resident.propertyTax * 100) }}%</span><br>
        </v-sheet>
        <v-sheet
        dark
        color="secondary lighten-2"
        elevation="10"
        :height="viewPortDimension.height*0.11"
        class="pa-4 my-5 mr-5"
        rounded="lg"
        >
          <span class="text-h6 font-weight-bold d-block text-center">{{resident.pet.petName}}</span><br>
          <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-trophy</v-icon>&nbsp;&nbsp;Experience: {{ $filters.formatIntAmount(resident.petExperience) }}</span><br>

        </v-sheet>
      </v-col>

      <!-- Home Pic -->
      <v-col cols="7">
        <v-card
                :width="(viewportWidth * 5.62) / 10"
                :height="resident.guild?((viewportHeight - navbarHeight) * 7.85) / 10:((viewportHeight - navbarHeight) * 8.5) / 10"
                elevation="10"
              >
                <!-- style="
                  background-image: url('/static/house3.jpg');
                  background-size: contain;
                  position: relative;
                " -->

                <v-img src="/static/house3.jpg">

                <!-- feed pet animation -->
                  <transition-group name="fade-down">
                    <!-- Reward Pet Experience -->
                    <span
                      style="left: 40px; bottom: 200px; position: absolute"
                      class="text-h5 black--text font-weight-bold text-center"
                      key="1"
                      v-if="tranStart"
                      >
                      <!-- src="https://www.animatedimages.org/data/media/1353/animated-medal-image-0013.gif"  -->
                      <v-img 
                      src="/static/animated-medal-image-0013.gif"
                      height="90" width="110" contain  />

                    &nbsp;&nbsp;&nbsp;&nbsp; +100</span
                    >
                    <!-- Reward Silver -->
                    <span
                      style="right: 40px; bottom: 200px; position: absolute"
                      class="text-h5 red--text font-weight-bold text-center"
                      key="2"
                      v-if="tranStart"
                      >
                      <!-- src="https://www.animatedimages.org/data/media/100/animated-money-image-0013.gif"  -->
                      <v-img 
                      src="/static/animated-money-image-0013.gif"

                      height="80" width="100" contain />

                      +{{ rewardSilver }}</span
                    >
                  </transition-group>

                  <!-- stash flyer animation -->
                  <Transition name="slide-fade">
                    <span
                      style="right: 480px; bottom: 190px; position: absolute; z-index: 10;"
                      class="text-h5 red--text font-weight-bold"
                      v-if="stashTranStart"
                      >
                      <!-- src="https://www.animatedimages.org/data/media/1335/animated-mail-image-0251.gif"  -->
                      <v-img 
                      src="/static/animated-mail-image-0251.gif"
                      height="90" width="110" contain />
                      </span>
                  </Transition>

                  <!-- Crack Egg animation -->
                  <Transition name="slideEgg-fade">
                     <span
                      style="left: 110px; bottom: 30px; position: absolute"
                      class="text-h5 red--text font-weight-bold"
                      key="2"
                      v-if="eggTranStart"
                      >
                      <!-- src="https://www.animatedimages.org/data/media/100/animated-money-image-0013.gif"  -->
                      <v-img 
                      src="/static/animated-money-image-0013.gif"

                      height="60" width="60" contain />

                      +100</span
                    >
                  </Transition>

                  <!-- Pet  -->
                  <v-container>
                    <v-banner
                        elevation="19"
                        color="primary"
                        dark
                        rounded='pill'
                        style="left: 80px; bottom: 120px; position: absolute"
                        class="font-weight-bold"
                        v-if="feedMe"
                      >Feed Me Flyers</v-banner>
                  <v-menu left offset-x open-on-hover>
                    <template v-slot:activator="{ on }">
                      <v-img
                        :src="petUrl"
                        v-if="petUrl"
                        v-on="on"
                        style="left: 25px; bottom: 20px; position: absolute"
                        @mouseenter="mouseEnterSize_pet"
                        @mouseleave="mouseLeaveSize_pet"
                        :style="{
                          width: targetWidth_Pet + 'px',
                          height: targetHeight_Pet + 'px',
                        }"
                        contain
                      ></v-img>
                    </template>

                    <v-list class="pa-1">
                      <v-list-item v-for="(item, index) in petItems" :key="index">

                        <v-list-item-title v-if="item.title == 'Experience'" class="accent--text"
                          ><v-icon class="mr-3" color="accent">{{ item.icon }}</v-icon
                          >{{ item.title }}&nbsp;
                          {{ $filters.formatIntAmount(resident.petExperience) }}</v-list-item-title
                        >
                        <v-list-item-title v-else class="accent--text" @click="isAIChatOpen=true"
                          ><v-icon class="mr-3" color="accent">{{ item.icon }}</v-icon
                          >{{ item.title }}</v-list-item-title
                        >
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <v-img
                        src="/static/goldEgg.png"
                        v-if="resident.pet.petName=='Chicken_Penny'&&!isEggCracked"
                        height="70"
                        width="70"
                        style="left: 110px; bottom: 20px; position: absolute"
                        contain
                        @click="crackEgg"
                      ></v-img>
                  <v-img
                        src="/static/crackedEgg.png"
                        v-if="resident.pet.petName=='Chicken_Penny'&&isEggCracked"
                        height="90"
                        width="90"
                        style="left: 120px; bottom: 10px; position: absolute"
                        contain
                      ></v-img>

                  </v-container>
                 

                  <!-- Mailbag -->
                  <v-menu left offset-x open-on-hover :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                        <v-img
                          v-on="on"
                          src="/static/mailbag-removebg-preview.png"
                          v-if="resident"
                          style="right: 480px; bottom: 80px; position: absolute"
                          tile
                          :style="{
                            width: targetWidth_Mailbag + 'px',
                            height: targetHeight_Mailbag + 'px',
                          }"
                          @mouseenter="mouseEnterSize_mailbag"
                          @mouseleave="mouseLeaveSize_mailbag"
                        >
                          <v-badge
                          overlap
                          :content="newMessages.toString()"
                          color="red"
                          offset-x="-80"
                          offset-y="10"
                          :value="newMessages>0"
                        >
                      </v-badge> 
                        
                        </v-img>
                    </template>

                    <v-list class="pa-1">
                      <v-list-item
                        v-for="(item, index) in mailbagItems"
                        :key="index"
                        @click="openMailbagHandler(index)"
                        class="accent--text"
                      >
                       <v-list-item-icon>
                          <v-icon  color="accent">{{ item.icon }}</v-icon>
                        </v-list-item-icon>
                         
                        <v-list-item-title v-if="item.title=='Flyers'">{{ item.title }}
                           <v-badge
                          inline
                          :content="flyersUnread.toString()"
                          :value="flyersUnread>0"
                        ></v-badge>
                        </v-list-item-title>
                          
                        
                        <v-list-item-title v-if="item.title!='Flyers'">{{ item.title }}</v-list-item-title>
                      </v-list-item>
                      <!-- Messages  -->
                       <v-list-group 
                        no-action 
                        color="accent">
                          <template v-slot:activator>
                            <v-list-item-icon>
                              <v-icon
                                class="mr-2"
                                dense
                                color="accent"
                                >mdi-message-text-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                               <v-list-item-title
                              class="accent--text "
                              >Messages</v-list-item-title>
                            </v-list-item-content>
                          </template>

                        <!-- Guild Messages -->
                          <v-list-item @click="isGuildMessageOpen=true" :disabled="!resident.guild">
                          <v-list-item-title
                            class="font-weight-light text-capitalize accent--text text-body-2 "
                          >
                            Guild Messages
                             <v-badge
                          overlap
                          color="red"
                          inline
                          :content="guildMessageCount.toString()"
                          :value="guildMessageCount>0"
                        > </v-badge>
                            </v-list-item-title
                          >
                        </v-list-item>

                        <!-- Vendor Messages -->
                          <v-list-item
                          @click="isVendorMessageOpen=true"
                        >
                          <v-list-item-title
                            class="font-weight-light text-capitalize accent--text text-body-2"
                          >Vendor Messages
                           <v-badge
                          overlap
                          color="red"
                          inline
                          :content="messageCount.toString()"
                          :value="messageCount>0"
                        ></v-badge>
                          </v-list-item-title>
                        </v-list-item>

                        <!-- System Messages -->
                        <v-list-item
                          @click="systemMessage"
                        >
                          <v-list-item-title
                            class="font-weight-light text-capitalize accent--text text-body-2"
                          >System Messages</v-list-item-title>
                        </v-list-item>
                    </v-list-group>
                    </v-list>
                  </v-menu>

                  <!-- Safe -->
                  <v-menu left offset-x open-on-hover>
                    <template v-slot:activator="{ on }">
                      <v-img
                        src="/static/safe1-removebg-preview.png"
                        v-if="resident"
                        style="right: 30px; bottom: 30px; position: absolute"
                        :style="{
                          width: targetWidth_Safe + 'px',
                          height: targetHeight_Safe + 'px',
                        }"
                        v-on="on"
                        @mouseenter="mouseEnterSize_safe"
                        @mouseleave="mouseLeaveSize_safe"
                      ></v-img>
                    </template>

                    <v-list class="pa-1">
                      <v-list-item
                        v-for="(item, index) in safeItems"
                        :key="index"
                        @click="openSafeHandler(index)"
                        :disabled="isDisabled(item.title)"
                      >
                        <v-list-item-title v-if="item.title == 'Silver'" class="accent--text"
                          ><v-icon class="mr-3" color="accent">{{ item.icon }}</v-icon
                          >{{ item.title }}
                          {{ $filters.formatIntAmount(resident.silverCoins) }}</v-list-item-title
                        >
                        <v-list-item-title v-else class="accent--text"
                          ><v-icon class="mr-3" color="accent">{{ item.icon }}</v-icon
                          >{{ item.title }}</v-list-item-title
                        >
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <!-- Guild  -->
                  <v-menu left offset-x open-on-hover>
                    <template v-slot:activator="{ on }">
                      <v-img
                        :src="guildLogo"
                        v-if="resident"
                        style="left: 120px; top: 50px; position: absolute"
                        :style="{
                          width: targetWidth_Guild + 'px',
                          height: targetHeight_Guild + 'px',
                        }"
                        v-on="on"
                        @mouseenter="mouseEnterSize_guild"
                        @mouseleave="mouseLeaveSize_guild"
                      ></v-img>
                    </template>
                    <!-- || item.title == 'Guild Deals' || item.title == 'Allies' -->
                    <v-list class="pa-1">
                      <v-list-item
                        v-for="(item, index) in guildItems"
                        :key="index"
                        @click="guildHandler(index)"
                        v-show="guildItemShow(item.title)"
                      >
                        <v-list-item-title class="accent--text">
                          <v-icon class="mr-3" color="accent">{{ item.icon }}</v-icon
                          >
                          {{ item.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <!-- </v-avatar> -->
                </v-img>
        </v-card>
      </v-col>


      <!-- Guild Info -->
      <v-col cols="2"  v-if="resident.guild">
              <v-sheet
                dark
                color="primary lighten-1"
                elevation="10"
                :height="viewPortDimension.height*0.38"
                class="pa-4"
                rounded="lg"
               
                >
                 <!-- <span  v-if="resident.guild.isRulingGuild && resident.guild.guildLeader == resident.residentName"> -->
                  
                
                <span class="text-h6 font-weight-bold d-block text-center">

                   Guild
                  </span><br>
                <span class="text-subtitle-1 white--text font-weight-bold d-block text-left">
                   
                  [&nbsp;{{resident.guild.guildFullName}}&nbsp;]
                <span v-if="resident.guildOwned">(leader)</span>
                   <v-menu 
                   right 
                   offset-x 
                   open-on-hover 
                    v-if="resident.guild.isRulingGuild && resident.guild.guildLeader == resident.residentName" 
                   :close-on-content-click="false" >
                    <template v-slot:activator="{ on }">
                       <v-avatar 
                       class="mb-3" 
                          v-on="on"
                       >
                          <v-img 
                          src="https://www.animatedimages.org/data/media/1299/animated-king-image-0026.gif" 
                          height="40" 
                          width="40" 
                          contain  />
                      </v-avatar>
                    </template>

                    <v-list class="pa-1">
                      <v-list-item
                        v-for="(item, index) in governorItems"
                        :key="index"
                        @click="openGovernorHandler(index)"
                        class="accent--text"
                      >
                       <v-list-item-icon>
                          <v-icon  color="accent">{{ item.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title >{{ item.title }}</v-list-item-title>
                      </v-list-item>
                    
                    </v-list>
                  </v-menu>
               
                </span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-account-tie</v-icon>&nbsp;&nbsp;Members:&nbsp;&nbsp;{{resident.guild.guildMembers.length}}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-chevron-triple-up</v-icon>&nbsp;&nbsp;Level:&nbsp;&nbsp;{{resident.guild.guildLevel}}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-counter</v-icon>&nbsp;&nbsp;Scores:&nbsp;&nbsp;{{ $filters.formatIntAmount(resident.guild.guildScores) }}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-coin</v-icon>&nbsp;&nbsp;Guild Silver:&nbsp;&nbsp;{{ $filters.formatIntAmount(resident.guild.guildSilver) }}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-account-cash</v-icon>&nbsp;&nbsp;Perk/Mo.:&nbsp;&nbsp;{{  resident.guild.perk * 100 + '%' }}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-offer </v-icon>&nbsp;&nbsp;Contribution:&nbsp;&nbsp;{{  resident.guild.contributionRatio * 100 +  '%'}}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-shield-star</v-icon>&nbsp;&nbsp;My Rank:&nbsp;&nbsp;{{myRank}}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-arm-flex</v-icon>&nbsp;&nbsp;Might:&nbsp;&nbsp;{{ $filters.formatIntAmount(myMight) }}</span><br>
                <span class="text-subtitle-2 font-weight-bold d-block text-left"><v-icon size="20" color="white">mdi-account-group</v-icon>&nbsp;&nbsp;Allies:&nbsp;&nbsp;{{allies}}</span><br>
                
                </v-sheet>
      </v-col>
    </v-row>

    <!-- Active Flyers List Dialog -->
    <v-dialog
      v-model="flyerOpen"
      max-width="1000"
      max-height="780"
      v-if="activeFlyerList"
    >
      <v-card flat style="border-top: 20px solid #7986CB">
        <v-card-title> Active Flyers </v-card-title>
        <v-data-table
          :headers="headers"
          :items="processedActiveFlyers"
          show-expand
          group-by="businessCategory"
          group-desc
          :single-expand="true"
          :expanded="expanded"
          @update:expanded="expanded = $event"
          class="elevation-1"
          show-group-by
          calculate-widths
        >
          <template v-slot:item.actions="{ item }">
            <v-avatar tile height="40" width="40" class="rounded-lg">
              <v-img :src="item.logo" contain></v-img>
            </v-avatar>
          </template>
          

          <template v-slot:expanded-item="{ item }">
            <td :colspan="flyerHeaders.length" class="mx-n6">
              <v-spacer></v-spacer>
              <v-data-table
                :headers="flyerHeaders"
                :items="item.vendorActiveFlyer"
                :sort-by="['flyerId']"
                :items-per-page="6"
                class="elevation-1 mx-n1"
                @click:row="handleActiveFlyerSelected"
              >

          <template v-slot:item.dateFrom="{ item }">
            <span>{{ $filters.convertDate(item.dateFrom) }}</span>
          </template>
          <template v-slot:item.dateTo="{ item }">
            <span>{{ $filters.convertDate(item.dateTo) }}</span>
          </template>
              </v-data-table>
              <v-spacer></v-spacer>
            </td>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>

    <!-- Stashed Flyers List Dialog -->
    <v-dialog
      v-model="flyerStashedOpen"
      max-width="1000"
      max-height="780"
      v-if="resident.stashedFlyers.length > 0"
    >
      <v-card flat style="border-top: 20px solid #7986CB">
        <v-card-title> Stashed Flyers </v-card-title>
        <v-data-table
          :headers="stashedFlyerHeaders"
          :items="processedStashedFlyers"
          class="elevation-1"
          calculate-widths
          sort-by="vendor"
          group-by="flyerType"
          group-desc
          show-expand
          :expanded="expanded"
          @update:expanded="expanded = $event"
          @click:row="handleActiveFlyerSelected"
        >
          <template v-slot:item.logo="{ item }">
            <v-avatar tile height="40" width="40" class="rounded-lg">
              <v-img :src="item.logo" contain></v-img>
            </v-avatar>
          </template>

          <template v-slot:item.dateFrom="{ item }">
            <span>{{ $filters.convertDate(item.dateFrom) }}</span>
          </template>
          <template v-slot:item.dateTo="{ item }">
            <span>{{ $filters.convertDate(item.dateTo) }}</span>
          </template>

          <!-- <template v-slot:expanded-item="{ item }">
            <td :colspan="flyerHeaders.length" class="mx-n6">
              <v-spacer></v-spacer>
              <v-data-table
                :headers="flyerHeaders"
                :items="resident.stahedFlyers"
                :sort-by="['flyerId']"
                :items-per-page="6"
                class="elevation-1 mx-n1"
                @click:row="handleActiveFlyerSelected"
              >
              </v-data-table>
              <v-spacer></v-spacer>
            </td>
          </template> -->
        </v-data-table>
      </v-card>
    </v-dialog>

    <!-- Start a Guild -->
    <v-dialog v-model="isStartGuildOpen" max-width="1000" max-height="780">
      <v-card flat class="pa-4" style="border-top: 20px solid #7986CB">
        <v-card-title>Start a Guild</v-card-title>
        <v-card-text>
          <v-form
            v-model="isGuildFormOk"
            lazy-validation
            ref="form"
            @submit.prevent="startGuild"
          >
            <v-row>
              <!-- Guild Full Name -->
              <v-col cols="8">
                <v-text-field
                  label="Guild Full Name"
                  v-model="guildFullName"
                  @blur="checkGuildName('fullName')"
                  :rules="guildNameRules"
                  required
                  clearable
                  :error-messages="errorMessageFull"
                  hint="Leader shares 18% guild income"
                  persistent-hint
                />
              </v-col>

              <!-- Guild Short Name -->
              <v-col cols="4">
                <v-text-field
                  label="Guild Short Name"
                  v-model="guildShortName"
                  @blur="checkGuildName('shortName')"
                  :rules="guildNameRules"
                  required
                  clearable
                  :error-messages="errorMessageShort"
                />
              </v-col>
            </v-row>

            <!-- Guild Logo -->
            <v-row>
              <v-col cols="12">
                <v-card outlined hover>
                  <v-card-title class="primary--text"
                    >Pick a guild logo</v-card-title
                  >
                  <v-slide-group
                    show-arrows
                    v-model="guildLogoChoice"
                    mandatory
                    center-active
                    required
                  >
                    <v-slide-item
                      v-for="(logo, i) in guildLogos"
                      :key="i"
                      v-slot:default="{ active, toggle }"
                      :value="logo.logoString"
                    >
                      <v-card
                        :color="active ? 'primary' : 'white'"
                        class="ma-4"
                        height="200"
                        width="100"
                        @click="toggle"
                      >
                        <v-row
                          class="fill-height"
                          align="center"
                          justify="center"
                        >
                          <v-img
                            :src="`/guildLogos/${logo.logoString}`"
                          ></v-img>
                          <v-scale-transition>
                            <v-icon
                              v-if="active"
                              color="white"
                              size="48"
                              v-text="'mdi-close-circle-outline'"
                            ></v-icon>
                          </v-scale-transition>
                        </v-row>
                      </v-card>
                    </v-slide-item>
                  </v-slide-group>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Guild Ratio -->

            <v-row>
              <v-col cols="6">
                <v-select
                  label="Perk"
                  v-model="perk"
                  hint="% of guild silver balance by month "
                  outlined
                  required
                  :items="guildPerkSelection">
                </v-select>
              </v-col>
              <v-col cols="6">
                 <v-select
                  label="Contribution"
                  hint="% of transaction"
                  v-model="contributionRatio"
                  outlined
                  required
                  :items="guildContributionRatio">
                </v-select>
              </v-col>
            </v-row>

            <!-- Guild Post -->
            <v-row>
              <v-col cols="12">
                <v-textarea
                  label="Guild Post"
                  v-model="guildPost"
                  required
                  :rules="guildPostRules"
                ></v-textarea>
              </v-col>
            </v-row>

            <v-row class="d-flex justify-end">
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="handleCancel"> Cancel </v-btn>

              <v-btn
                color="#ff9800"
                text
                :disabled="!isGuildFormOk"
                type="submit"
              >
                Start Guild
              </v-btn>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>


    <!-- Edit a Guild -->
    <v-dialog v-model="isEditGuildOpen" max-width="1000" max-height="780">
      <v-card flat class="pa-4" style="border-top: 20px solid #7986CB">
        <v-card-title>Edit Guild</v-card-title>
        <v-card-text>
          <v-form
            v-model="isEditGuildFormOk"
            lazy-validation
            ref="form"
            @submit.prevent="editGuild"
          >
            <v-row>
              <!-- Guild Full Name -->
              <v-col cols="8">
                <v-text-field
                  label="Guild Full Name"
                  v-model="guildFullName"
                  @blur="checkGuildName('fullName')"
                  :rules="guildNameRules"
                  required
                  clearable
                  :error-messages="errorMessageFull"
                  hint="Leader shares 18% guild income"
                  persistent-hint
                />
              </v-col>

              <!-- Guild Short Name -->
              <v-col cols="4">
                <v-text-field
                  label="Guild Short Name"
                  v-model="guildShortName"
                  @blur="checkGuildName('shortName')"
                  :rules="guildNameRules"
                  required
                  clearable
                  :error-messages="errorMessageShort"
                />
              </v-col>
            </v-row>

            <!-- Guild Logo -->
            <v-row>
              <v-col cols="12">
                <v-card outlined hover>
                  <v-card-title class="primary--text"
                    >Pick a guild logo</v-card-title
                  >
                  <v-slide-group
                    show-arrows
                    v-model="guildLogoChoice"
                    mandatory
                    center-active
                    required
                  >
                    <v-slide-item
                      v-for="(logo, i) in guildLogos"
                      :key="i"
                      v-slot:default="{ active, toggle }"
                      :value="logo.logoString"
                    >
                      <v-card
                        :color="active ? 'primary' : 'white'"
                        class="ma-4"
                        height="200"
                        width="100"
                        @click="toggle"
                      >
                        <v-row
                          class="fill-height"
                          align="center"
                          justify="center"
                        >
                          <v-img
                            :src="`/guildLogos/${logo.logoString}`"
                          ></v-img>
                          <v-scale-transition>
                            <v-icon
                              v-if="active"
                              color="white"
                              size="48"
                              v-text="'mdi-close-circle-outline'"
                            ></v-icon>
                          </v-scale-transition>
                        </v-row>
                      </v-card>
                    </v-slide-item>
                  </v-slide-group>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Guild Ratio -->

            <v-row>
              <v-col cols="6">
                <v-select
                  label="Perk"
                  v-model="perk"
                  hint="% of guild silver balance by month "
                  outlined
                  required
                  :items="guildPerkSelection">
                </v-select>
              </v-col>
              <v-col cols="6">
                 <v-select
                  label="Contribution"
                  hint="% of transaction"
                  v-model="contributionRatio"
                  outlined
                  required
                  :items="guildContributionRatio">
                </v-select>
              </v-col>
            </v-row>

            <!-- Guild Post -->
            <v-row>
              <v-col cols="12">
                <v-textarea
                  label="Guild Post"
                  v-model="guildPost"
                  required
                  :rules="guildPostRules"
                ></v-textarea>
              </v-col>
            </v-row>

            <v-row class="d-flex justify-end">
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="handleCancel"> Cancel </v-btn>

              <v-btn
                color="#ff9800"
                text
                :disabled="!isEditGuildFormOk"
                type="submit"
              >
                Save 
              </v-btn>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Join a Guild -->
    <v-dialog v-model="isJoinGuildOpen" max-width="1000" max-height="780" v-if="guilds">
      <v-card flat class="pa-4" style="border-top: 20px solid #7986CB" >
        <v-card-title>Join a Guild</v-card-title>
        <v-card-text>
          
          <v-row no-gutters>
            <v-col cols="12">
              <v-simple-table fixed-header height="500">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Logo</th>
                      <th class="text-left">Full Name</th>
                      <th class="text-left">Short Name</th>
                      <th class="text-left">Guild Rank</th>
                      <th class="text-left">Members</th>
                      <th class="text-left">Scores</th>
                      <th class="text-left">Perk/Mo(%)</th>
                      <th class="text-left">Contribution(%)</th>
                      <th class="text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <v-tooltip top>
                      <template v-slot:activator="{on}">
                        <tr
                          v-for="(item, i) in guilds"
                          :key="i"
                          @mouseover="showGuildPost(item.guildPost)"
                          v-on="on"
                        >
                          <td>
                            <v-img
                              contain
                              width="100"
                              height="100"
                              :src="`/guildLogos/${item.guildLogo}`"
                            />
                          </td>
                          <td>{{ item.guildFullName }}</td>
                          <td>{{ item.guildShortName }}</td>
                          <td>{{ item.guildLevel.toString() }}</td>
                          <td>{{ item.guildMembers.length }}</td>
                          <td>{{ item.guildScores }}</td>
                          <td>{{ item.perk * 100 }}</td>
                          <td>{{ item.contributionRatio * 100 }}</td>
                          <td >
                            <v-radio-group v-model="guildChose" column>
                              <v-radio :value="item._id"></v-radio>
                            </v-radio-group>
                          </td>
                        </tr>
                      </template>
                      <p>
                          {{ guildPostDisplay }}
                      </p>
                    </v-tooltip>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-end">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              depressed
              :disabled="!guildChose"
              @click="joinGuild"
            >
              Join Guild
            </v-btn>

            <v-btn color="primary" text plain @click="isJoinGuildOpen = false">
              Cancel
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Ally a Guild -->
    <v-dialog v-model="isAllyGuildOpen" max-width="1000" max-height="780" v-if="guilds">
      <v-card flat class="pa-4" style="border-top: 20px solid #7986CB" >
        <v-card-title>Ally a Guild</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-simple-table height="500" fixed-header>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Logo</th>
                      <th class="text-left">Full Name</th>
                      <th class="text-left">Short Name</th>
                      <th class="text-left">Guild Rank</th>
                      <th class="text-left">Members</th>
                      <th class="text-left">Scores</th>
                      <th class="text-left">Allied</th>
                      <th class="text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                     <v-tooltip top v-for="(item, i) in guilds"
                      :key="i" >
                      <template v-slot:activator="{on}">
                    <tr
                      
                      @mouseover="showGuildPost(item.guildPost)"
                      v-on="on"
                      v-if="item.guildFullName!=resident.guild.guildFullName"
                    >
                      <td>
                        <v-img
                          contain
                          width="100"
                          height="100"
                          :src="`/guildLogos/${item.guildLogo}`"
                        />
                      </td>
                      <td>{{ item.guildFullName }}</td>
                      <td>{{ item.guildShortName }}</td>
                      <td>{{ item.guildLevel.toString() }}</td>
                      <td>{{ item.guildMembers.length }}</td>
                      <td>{{ item.guildScores }}</td>
                      <td>{{ isAllied(item.guildFullName) ? 'yes' : 'no' }}</td>
                      <td v-if="!isAllied(item.guildFullName)">
                        <v-radio-group v-model="guildToAlly" column>
                          <v-radio :value="item.guildFullName"></v-radio>
                        </v-radio-group>
                      </td>
                      <td v-else>
                        <v-btn text disabled="true" ><v-icon size="28" class="ml-n9">mdi-account-switch</v-icon></v-btn>
                      </td>
                      <td v-if="isAllied(item.guildFullName)&&isRequest(item.guildFullName)">
                        <v-btn x-small depressed color="primary" @click="disally(item.guildFullName)">Disally</v-btn>
                      </td>
                      <td v-else><v-spacer></v-spacer></td>
                    </tr>
                     </template>
                      <p>
                          {{ guildPostDisplay }}
                      </p>
                    </v-tooltip>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
         
          <v-row class="d-flex justify-center">
            <p class="text-center accent--text">
            To ally with a guild, your guild commits a  tribute amounted to 10% of monthly guild income to the ally for at least a month
            </p>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn
              color="primary"
              depressed
              :disabled="!guildToAlly || !resident.guildOwned"
              @click="allyGuild"
            >
              Ally Guild
            </v-btn>

            <v-btn color="primary" text plain @click="isAllyGuildOpen = false">
              Cancel
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Refer a Guild Deal to Ally -->
    <v-dialog v-model="isrReferDealOpen" max-width="1000" max-height="780" v-if="guilds">
      <v-card flat class="pa-4" style="border-top: 20px solid #7986CB" >
        <v-card-title>Refer Guild Deal</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-simple-table height="500" fixed-header>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Logo</th>
                      <th class="text-left">Full Name</th>
                      <th class="text-left">Short Name</th>
                      <th class="text-left">Guild Rank</th>
                      <th class="text-left">Members</th>
                      <th class="text-left">Scores</th>
                      <th class="text-left">Allied</th>
                      <th class="text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                     <v-tooltip top v-for="(item, i) in guilds"
                      :key="i" >
                      <template v-slot:activator="{on}">
                    <tr
                      
                      @mouseover="showGuildPost(item.guildPost)"
                      v-on="on"
                      v-if="isAllied(item.guildFullName)"
                    >
                      <td>
                        <v-img
                          contain
                          width="100"
                          height="100"
                          :src="`/guildLogos/${item.guildLogo}`"
                        />
                      </td>
                      <td>{{ item.guildFullName }}</td>
                      <td>{{ item.guildShortName }}</td>
                      <td>{{ item.guildLevel.toString() }}</td>
                      <td>{{ item.guildMembers.length }}</td>
                      <td>{{ item.guildScores }}</td>
                      <td>{{ isAllied(item.guildFullName) ? 'yes' : 'no' }}</td>
                      <td>
                        <!-- <v-radio-group v-model="guildToAlly" column> -->
                          <v-checkbox :value="item.guildFullName" v-model="guildSelected"></v-checkbox>
                        <!-- </v-radio-group> -->
                      </td>
                    </tr>
                     </template>
                      <p>
                          {{ guildPostDisplay }}
                      </p>
                    </v-tooltip>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
         
          <v-row class="d-flex justify-center">
            <p class="text-center accent--text">
            If ally commits the guild deal referred, your guild can be rewarded lump sum 1,000 silver plus 1% of the total purchase your ally makes under the deal.
            </p>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn
              color="primary"
              depressed
              :disabled="guildSelected.length==0"
              @click="isrReferDealOpen = false"
            >
              Send Referral
            </v-btn>

            <v-btn color="primary" text plain @click="isrReferDealOpen = false">
              Cancel
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- My Guild -->
    <v-dialog
      v-model="isMyGuildOpen"
      max-width="1300"
      max-height="780"
      v-if="resident.guild!=null"
    >
      <v-card flat class="pa-4" style="border-top: 15px solid #7986CB" width="1300">
        <v-card-subtitle>
          <v-row no-gutters class="d-flex justify-start align-center">
            <v-col cols="3">
              <!-- <v-row class="d-flex flex-row justify-start align-center"> -->
                  <v-img
                contain
                width="65"
                height="65"
                :src="`/guildLogos/${resident.guild.guildLogo}`"
                class="d-inline-block ml-n24"
              > 
              
              </v-img>
               <span  v-if="resident.guild!=null" class="accent--text text--darken-3  text-button" style="z-index: 100;">{{
              `${resident.guild.guildFullName} (${resident.guild.guildShortName})`
            }}</span>
              <!-- </v-row> -->
            

            </v-col>
          
            <v-col cols="2" class="primary--text  font-weight-bold">Leader: {{ guildLeader }}</v-col>
            <v-col cols="2" class="primary--text  font-weight-bold"
              >Members: {{ resident.guild.guildMembers.length }}</v-col
            >
            <v-col cols="2" class="primary--text text--darken-2 font-weight-bold" 
              >Treasure:
              {{ $filters.formatIntAmount(resident.guild.guildSilver) }}</v-col
            >

            <v-col cols="2" class="primary--text  font-weight-bold">Contribution:&nbsp;{{ resident.guild.contributionRatio * 100 + '%' }}</v-col>
            <v-col cols="1" class="primary--text  font-weight-bold">Perk/Mo:&nbsp;{{ resident.guild.perk * 100 + '%' }}</v-col>
          </v-row>
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-simple-table fixed-header height="500">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Avatar</th>
                      <!-- <th class="text-left">Full Name</th> -->
                      <th class="text-left">Nick Name</th>
                      <th class="text-left">Rank</th>
                      <th class="text-left">Might</th>
                      <th class="text-left">Contri.(Last Mon.)</th>
                      <th class="text-left">Contri.(This Mon.)</th>
                      <th class="text-left">Contact</th>
                      <th class="text-left" v-if="resident.guildOwned">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(member, i) in processedGuildMembers"
                      :key="i"
                    >
                      <td>
                        <v-avatar size="24" class="rounded-lg">
                          <v-img :src="member.avatar" />
                        </v-avatar>
                      </td>
                      <!-- <td>{{ member.name }}</td> -->
                      <td>{{ member.nickName }}</td>
                      <td>{{ member.rank }}</td>
                      <td>{{ member.might }}</td>
                      <td>{{ $filters.formatIntAmount(member.contriLast) }}</td>
                      <td>{{ $filters.formatIntAmount(member.contriCurrent) }}</td>
                      <td v-if="member.name!=resident.residentName">
                        <v-btn icon @click="messageGuildMember(member)">
                          <v-icon medium color="primary">mdi-message-text</v-icon>
                        </v-btn></td>
                      <td v-else><v-spacer /></td>
                      <!-- Guild Manage Button -->
                      <td v-if="resident.guildOwned&&member.name!=resident.residentName">
                        <v-menu
                          bottom
                          :close-on-content-click="true"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn 
                              dark 
                              x-small 
                              depressed 
                              color="primary" 
                              v-bind="attrs"
                              v-on="on">Manage</v-btn>
                          </template>

                          <v-list>
                            <v-list-item
                              v-for="(item, index) in guildManageItems"
                              :key="index"
                              @click="manageGuildMember(member.name, member.nickName, member.rank, index)"
                              :disabled="index==1&&!canReward(member.name)"
                            >
                              <v-list-item-title class="accent--text text-body-1">
                                <v-icon class="mr-3" color="accent" small>{{ item.icon }}</v-icon>
                                {{ item.title }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>
                      <td v-if="resident.guildOwned&&member.name==resident.residentName">
                        <!-- <v-spacer></v-spacer> -->
                        <v-menu
                          bottom
                          :close-on-content-click="true"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <!-- <v-btn 
                              dark 
                              x-small 
                              depressed 
                              color="primary" 
                             >Manage</v-btn> -->
                               <v-btn 
                               v-bind="attrs"
                              v-on="on"
                              dark 
                              x-small 
                              depressed 
                              color="primary" 
                              >Guild Leader</v-btn>

                          </template>

                          <v-list>
                            <v-list-item
                              v-for="(item, index) in guildLeaderItems"
                              :key="index"
                              @click="leaderOrders(index)"
                              
                            >
                              <v-list-item-title class="accent--text text-body-1">
                                <v-icon class="mr-3" color="accent" small>{{ item.icon }}</v-icon>
                                {{ item.title }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                       
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Guild Deals -->
    <v-dialog
      v-model="isGuildDealsOpen"
      max-width="1500"
      max-height="780"
      persistent
      fullscreen
    >
      <v-card class="pa-10" flat rounded="3" style="border-top: 15px solid #7986CB">
        <v-card-title class="fontColor--text text--darken-3">Guild Deals</v-card-title>
        <v-card-text>
          <!-- Active Guild Deals -->
          <v-container fluid >
            <v-data-iterator
              :items="activeAllGuildDeals"
              :items-per-page="itemsPerPage"
              @update:items-per-page="itemsPerPage = $event"
              :page="page"
              @update:page="page = $event"
              :search="search"
              :sort-by="sortBy"
              :sort-desc="sortDesc"
              hide-default-footer
            >
              <!-- toolbar -->
              <template v-slot:header>
                <v-toolbar dark flat dense color="primary" class="mb-1">
                  <v-toolbar-title class="text-h6">Deals Available</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="search"
                    dense
                    clearable
                    flat
                    solo-inverted
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    label="Search"
                  ></v-text-field>
                  <v-spacer></v-spacer>
                   <v-select
                        v-model="filterDealByCate"
                        :items="restaurantCategories"
                        clearable
                        filled
                        dense
                        flat
                        label="Filter by"
                        class="mt-6"
                      ></v-select>
                  <template v-if="$vuetify.breakpoint.mdAndUp">
                    <v-spacer></v-spacer>
                    <!-- <v-select
                          v-model="sortBy"
                          flat
                          solo-inverted
                          hide-details
                          :items="keys"
                          prepend-inner-icon="mdi-magnify"
                          label="Sort by"
                        ></v-select>
                        <v-spacer></v-spacer> -->
                    <v-btn-toggle v-model="sortDesc" mandatory>
                      <v-btn small depressed color="primary lighten-1" :value="false">
                        <v-icon>mdi-arrow-up</v-icon>
                      </v-btn>
                      <v-btn small depressed color="primary lighten-1" :value="true">
                        <v-icon>mdi-arrow-down</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </template>
                </v-toolbar>
              </template>

              <!-- guild deal cards -->
              <template v-slot:default="props" >
                <v-row v-if="activeAllGuildDeals.length>0">
                  <v-col
                    v-for="(item, i) in props.items"
                    :key="item.vendor"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-tooltip top color="#424242">
                      <template v-slot:activator="{ on, attrs }">
                        <v-card
                          class="pa-2"
                          v-if="item.active"
                          v-bind="attrs"
                          v-on="on"
                          
                        >
                          <v-card-subtitle>
                            <v-row class="d-flex flex-row justify-center align-center ">
                              <v-col cols="5">
                                <v-btn x-small icon @click="toVendorInter(item.vendor)"><v-icon color="primary">mdi-feature-search-outline</v-icon></v-btn>
                                <v-avatar tile size="60" class="rounded-lg"
                                  ><v-img :src="item.vendorLogo" contain height="50" width="50"/>
                                  </v-avatar>
                              </v-col>
                              <v-col
                                cols="5"
                                class="subheading font-weight-bold"
                              >
                                {{ item.vendor }}
                              </v-col>
                              <v-col
                                cols="2"
                                v-if="resident.guildOwned != null"
                              >
                                <v-checkbox
                                  v-model="dealsCommited"
                                  @change="indexOfdealSelected.push(i)"
                                  :value="item._id"
                                ></v-checkbox>
                              </v-col>
                            </v-row>
                          </v-card-subtitle>

                          <v-divider></v-divider>

                          <v-card-text>
                            <v-row no-gutters>
                              <v-col cols="7" class="pr-1 secondary--text"
                                >Type: {{ item.guildDealType }}
                                <v-col
                                  cols="12"
                                  v-if="
                                    item.guildDealType ==
                                    'Specific Item Purchase'
                                  "
                                >
                                  <v-row
                                    v-for="(listItem, i) in item.specificItemList" class="my-1"
                                    :key="i"
                                    >{{ listItem }}</v-row
                                  >
                                </v-col>
                              </v-col>
                              <v-col cols="5" class="pl-2"
                                >Redeem: {{ item.dealRedeemTerm }}</v-col
                              >
                            </v-row>

                            <v-row>
                              <!-- <v-col cols="6" v-convert-date="{toOrFrom: 'From: ', date: item.dateFrom}"></v-col>
                              <v-col cols="6" v-convert-date="{toOrFrom: 'To: ', date: item.dateTo}"></v-col> -->
                              <v-col cols="6"
                                >From:
                                {{ $filters.convertDate(item.dateFrom) }}</v-col
                              >
                              <v-col cols="6"
                                >To: {{ $filters.convertDate(item.dateTo) }}</v-col
                              >
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </template>
                      <!-- tooltip content -->
                      <v-row>
                        <v-col cols="1">
                          <v-row class="my-1">Levels</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i + 1 }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1 ml-3">Condition</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i == 0 ? level.guildDealCondition : "" }}</v-row
                          >
                        </v-col>
                        <v-col cols="2">
                          <v-row class="my-1">Amount / Mo.</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatCurrencyAmount(level.guildDealAmount) }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">RewardItems</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                          >
                            <v-icon>{{
                              rewardItemIcon(level.rewardItemsSelected[0])
                            }}</v-icon
                            >{{ rewardItemName(level.rewardItemsSelected[0]) }}
                          </v-row>
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">Rwd.Amt./ Mo. </v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatIntAmount(level.rewardAmount) }}</v-row
                          >
                        </v-col>
                      </v-row>
                    </v-tooltip>
                  </v-col>
                    
                </v-row>
                <span v-else>No Active Guild Deals to Commit</span>
              </template>
                
              
              <template v-slot:footer>
                <v-row class="mt-2" align="center" justify="center">
                  <!-- <span class="grey--text">Items per page</span>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            dark
                            text
                            color="primary"
                            class="ml-2"
                            v-bind="attrs"
                            v-on="on"
                          >
                            {{ itemsPerPage }}
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(number, index) in itemsPerPageArray"
                            :key="index"
                            @click="updateItemsPerPage(number)"
                          >
                            <v-list-item-title>{{ number }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu> -->

                  <v-spacer></v-spacer>

                  <span class="mr-4 fontColor--text">
                    Page {{ page }} of {{ numberOfPages }}
                  </span>
                  <v-btn
                    fab
                    dark
                    color="primary"
                    class="mr-1"
                    @click="formerPage"
                    small
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <v-btn
                    small
                    fab
                    dark
                    color="primary"
                    class="ml-1"
                    @click="nextPage"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-data-iterator>
          </v-container>

         
          <v-divider class="my-1"></v-divider>


          <!-- Guild Deals Status -->
          <v-container fluid v-if="guildDealsStatus.length>0">
            <v-data-iterator
              :items="guildDealsStatus"
              :items-per-page="itemsPerPage"
              @update:items-per-page="itemsPerPage = $event"
              :page="page"
              @update:page="page = $event"
              :search="searchStatus"
              :sort-desc="sortDesc"
              hide-default-footer
            >
              <template v-slot:header>
                <v-toolbar dark dense flat color="primary" class="mb-1">
                  <!-- <v-btn text plain color="#fff" dark
                    >Commited Deals Status</v-btn
                  > -->
                   <v-toolbar-title class="text-h6">Commited Deals Status</v-toolbar-title>

                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="searchStatus"
                    clearable
                    flat
                    dense
                    solo-inverted
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    label="Search"
                  ></v-text-field>
                  <template v-if="$vuetify.breakpoint.mdAndUp">
                    <v-spacer></v-spacer>
                    <!-- <v-select
                          v-model="sortBy"
                          flat
                          solo-inverted
                          hide-details
                          :items="keys"
                          prepend-inner-icon="mdi-magnify"
                          label="Sort by"
                        ></v-select>
                        <v-spacer></v-spacer> -->
                    <v-btn-toggle v-model="sortDesc" mandatory>
                      <v-btn small depressed color="primary lighten-1" :value="false">
                        <v-icon>mdi-arrow-up</v-icon>
                      </v-btn>
                      <v-btn small depressed color="primary lighten-1" :value="true">
                        <v-icon>mdi-arrow-down</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </template>
                </v-toolbar>
              </template>

              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="(item, i) in props.items"
                    :key="i"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-tooltip top color="#424242">
                      <template v-slot:activator="{ on, attrs }">
                        <v-card class="pa-2" v-bind="attrs" v-on="on">
                          <v-card-subtitle>
                            <v-row class="d-flex align-center">
                              <v-col cols="4">
                                <v-avatar tile size="40"
                                  ><v-img :src="item.vendorLogo" contain
                                /></v-avatar>
                              </v-col>
                              <v-col
                                cols="4"
                                class="text-subtitle-1 font-weight-bold accent--text"
                              >
                                {{ item.vendor }}
                              </v-col>
                              <v-col cols="4">
                                <v-btn text plain @click="referDeal">
                                  <v-icon  large color="primary">mdi-share-all</v-icon>
                                </v-btn>
                              </v-col>
                              <!-- <v-col cols="4">
                                <v-checkbox v-model="dealsCommited" :value="item._id"></v-checkbox>
                              </v-col> -->
                            </v-row>
                          </v-card-subtitle>

                          <v-divider></v-divider>

                          <v-card-text>
                            <v-row no-gutters>
                              <v-col cols="7" class="secondary--text"
                                >Type: {{ item.guildDealType }}
                              <v-col
                                cols="12"
                                v-if="
                                  item.guildDealType ==
                                  'Specific Item Purchase'
                                "
                              >
                                <v-row
                                  v-for="(listItem, i) in item.specificItemList"
                                  :key="i" class="my-1"
                                  >{{ listItem }}</v-row
                                >
                              </v-col>
                              </v-col>
                              <v-col cols="5" class="pl-3 fontColor--text text--darken-2"
                                >Redeem: {{ item.redeemTerm }}</v-col
                              >
                            </v-row>

                            <v-row>
                              <!-- <v-col cols="6" v-convert-date="{toOrFrom: 'From: ', date: item.dateFrom}"></v-col>
                              <v-col cols="6" v-convert-date="{toOrFrom: 'To: ', date: item.dateTo}"></v-col> -->
                              <v-col cols="6"
                                >From:
                                {{ $filters.convertDate(item.dateFrom) }}</v-col
                              >
                              <v-col cols="6"
                                >To: {{ $filters.convertDate(item.dateTo) }}</v-col
                              >
                            </v-row>
                          </v-card-text>
                          <v-card-actions >
                            <v-spacer></v-spacer>
                            <v-btn text plain @click="showGuildTransactions(item.transactions)" v-if="item.transactions.length>0">
                              <v-icon medium color="primary">mdi-feature-search-outline</v-icon>
                            </v-btn>
                            <v-spacer></v-spacer>
                          </v-card-actions>

                        </v-card>
                      </template>
                      <v-row>
                        <v-col cols="1">
                          <v-row class="my-1">Levels</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i + 1 }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1 ml-3">Condition</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ i == 0 ? level.guildDealCondition : "" }}</v-row
                          >
                        </v-col>
                        <v-col cols="2">
                          <v-row class="my-1">Amount/Mo.</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatCurrencyAmount(level.guildDealAmount) }}</v-row
                          >
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">RewardItems</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                          >
                            <v-icon>{{
                              rewardItemIcon(level.rewardItemsSelected[0])
                            }}</v-icon
                            >{{ rewardItemName(level.rewardItemsSelected[0]) }}
                          </v-row>
                        </v-col>
                        <v-col cols="3">
                          <v-row class="my-1">Rwd.Amt./ Mo.</v-row>
                          <v-row
                            v-for="(level, i) in item.guildDealLevels"
                            :key="i"
                            class="ma-1"
                            >{{ $filters.formatIntAmount(level.rewardAmount) }}</v-row
                          >
                        </v-col>
                        <!-- Transaction -->
                      </v-row>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </template>

              <template v-slot:footer>
                <v-row class="mt-2" align="center" justify="center">
                  <!-- <span class="grey--text">Items per page</span>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            dark
                            text
                            color="primary"
                            class="ml-2"
                            v-bind="attrs"
                            v-on="on"
                          >
                            {{ itemsPerPage }}
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(number, index) in itemsPerPageArray"
                            :key="index"
                            @click="updateItemsPerPage(number)"
                          >
                            <v-list-item-title>{{ number }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu> -->

                  <v-spacer></v-spacer>

                  <span class="mr-4 grey--text">
                    Page {{ page }} of {{ numberOfPages }}
                  </span>
                  <v-btn
                    fab
                    dark
                    depressed
                    color="primary"
                    class="mr-1"
                    @click="formerPage"
                    small
                  >
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <v-btn
                    small
                    fab
                    dark
                    depressed
                    color="primary"
                    class="ml-1"
                    @click="nextPage"
                  >
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-data-iterator>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed  @click="exitDialogue = true" large>
            Exit
          </v-btn>
          <v-btn
          large
            color="primary"
            text
            @click="commit"
            :disabled="
              (!dealsCommited.length > 0 && resident.guildOwned != null) ||
              resident.guildOwned == null
            "
          >
            Commit
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Locate Guild Member -->
    <v-dialog v-if="guildMemberLocation.length>0"  v-model="isMemberLocationOpen" max-width="1000" max-height="800">
      <!-- <v-card> -->
        <MemberLocationMap
          id="map"
          :markerList="guildMemberLocation"
          justify-center
          class="pa-1 rounded "
          style=" height: 800px; width: 1000px" 
      ></MemberLocationMap>
      <!-- </v-card> -->

    </v-dialog>

    <!-- Exit dialogue -->
    <v-dialog v-model="exitDialogue" max-width="500px">
      <v-card class="pa-5"  style="border-top: 15px solid #B75420">
        <v-card-text class="text-h6 accent--text">Exit, Are you sure ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="accent" text outlined @click="exitDialogue = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" text @click="close">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Preview  Flyer  Dialog -->
    <v-dialog
      v-model="previewDiaOpen"
      max-width="1000"
      max-height="780"
      v-if="clientPageView"
    >
    
      <v-card max-width="1000" class="mx-auto px-3">
        <v-card-text>
          <v-container class="pa-5">
            <v-item-group v-model="selected" multiple>
              <v-row>
                <v-col v-for="(item, i) in clientPageView" :key="i" cols="6">
                  <v-item v-slot:default="{ active }">
                    <v-card hover outlined>
                      <v-img
                        :src="'data:image/jpeg;base64,' + item.base64"
                        class="text-right pa-3"
                        @click="handleSinglePage(item)"
                        contain
                      >
                      </v-img>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            icon
            color="primary"
            x-large
            @click="stashFlyer"
            v-if="stashIsOn"
          >
            <v-icon> mdi-heart-outline </v-icon>
          </v-btn>
          <v-btn
            icon
            color="primary"
            x-large
            @click="feedPet(stashIsOn ? 'Active' : 'Stash')"
          >
            <v-icon> mdi-pig </v-icon>
          </v-btn>
          <!-- <v-btn icon color="primary" x-large>
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Guild Deal Transaction  Dialog -->
    <v-dialog v-model="isGuildTransactionOpen" max-width="800" max-height="780" v-if="guildTransactions.length>0">
      <v-card max-width="1000" class="pa-2">
         <v-simple-table
                  fixed-header
                  :height="viewPortDimension.height * 0.38"
                >
                <template v-slot:default>
                <thead>
                    <tr>
                    <th class="text-left">
                        Member
                    </th>
                    <th class="text-left">
                        Date
                    </th>
                    <th class="text-left">
                        Vendor
                    </th>
                    <th class="text-left">
                        Transaction No.
                    </th>
                    <th class="text-left">
                        Amount
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                    v-for="item in guildTransactions"
                    :key="item.transactionId"
                    >
                    <td>{{ item.resident }}</td>
                    <td>{{ $filters.convertDate(item.date) }}</td>
                    <td>{{ item.vendor }}</td>
                    <td>{{ item.transactionId }}</td>
                    <td>{{ $filters.formatCurrencyAmount(item.purchaseAmount) }}</td>
                    </tr>
                </tbody>
                </template>
                </v-simple-table>

                <v-card-actions class="primary--text font-weight-bold text-subtitle-1">
                  <v-spacer></v-spacer>
                  Total:&nbsp;{{ $filters.formatCurrencyAmount(guildTransactionTotal) }}&nbsp;for month &nbsp;{{(new Date().getMonth() + 1).toString()}}
                  </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Preview  Single Page  Dialog -->
    <v-dialog v-model="singlePageOpen" max-width="1000" max-height="780">
      <v-card max-width="1000" class="px-1" @click="toVendorInter(singlePage.vendor)">
        <v-container class="pa-5">
          <v-img
            :src="'data:image/jpeg;base64,' + singlePage.base64"
            class="text-right pa-3"
            :width="singlePage.width * 2.5"
            :height="singlePage.height * 1.8"
            contain
          />
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Reward Dialog -->
    <v-dialog v-model="isRewardWindowOpen" max-width="400" max-height="200" v-if="resident.guild!=null">
      <v-card width="400" height="200" class="pt-2">
        <v-card-subtitle class="accent--text text-center" v-if="memberSelected">{{memberSelected.nickName}}</v-card-subtitle>
          <v-card-text>
            <v-spacer/>
                <v-col cols="12">
                    <v-row><span class="mx-1 font-weight-bold"><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{ $filters.formatIntAmount(resident.guild.guildSilver-silverToReward) }}</span>
                <v-slider
                    :max="Math.round(resident.guild.guildSilver * resident.guild.perk / resident.guild.guildMembers.length)"
                    v-model="silverToReward"
                    step="100"
                ></v-slider>
                <span class="font-weight-bold"><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{ $filters.formatIntAmount(silverToReward) }}</span></v-row>
                </v-col>
                <v-spacer/>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn depressed color="primary" :disabled="silverToReward==0" @click="rewardGuildMember">Confirm</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Welfare Dialog -->
    <v-dialog v-model="isWelfareOpen" max-width="400" max-height="200">
      <v-card width="400" height="200" class="pt-2">
        <v-card-subtitle class="accent--text text-center text-subtitle-1 font-weight-bold" >Share Benefit Equally</v-card-subtitle>
          <v-card-text>
            <v-spacer/>
                <v-col cols="12">
                    <v-row><span class="mx-1 font-weight-bold"><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{(Math.round(cityHall.treasure / cityHall.population)) }}</span>
                <v-slider
                    :max="Math.round(cityHall.treasure / cityHall.population)"
                    v-model="silverForWelfare"
                    step="1"
                ></v-slider>
                <span class="font-weight-bold"><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{ $filters.formatIntAmount(silverForWelfare) }}</span></v-row>
                </v-col>
                <v-spacer/>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn depressed color="primary" :disabled="silverForWelfare==0" @click="distributeWelfare">Confirm</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- promote Dialog -->
    <v-dialog v-model="isPromoteWindowOpen" max-width="400" max-height="200">
      <v-card width="400" height="200" class="pt-2">
        <v-card-subtitle class="accent--text text-center" v-if="memberSelected">{{memberSelected.nickName}}</v-card-subtitle>
         <v-card-text>
            <v-select
              :items="guildRank"
              label="Current Rank"
              v-model="rank"
            ></v-select>
         </v-card-text>
         <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn depressed color="primary" @click="promoteGuildMember">Confirm</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- leadership transfer Dialog -->
    <v-dialog v-model="isTransferWindowOpen" max-width="450" max-height="150">
      <v-card width="400" height="200" class="pt-2">
        
        <!-- <v-card-subtitle class="accent--text text-center" v-if="memberSelected"></v-card-subtitle> -->
         <v-card-text>
           <v-card-title v-if="memberSelected">
           Transfer leadership to &nbsp;{{memberSelected.nickName}}&nbsp;?
         </v-card-title>
         </v-card-text>
         
         <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text plain color="primary" @click="isTransferWindowOpen=false">Cancel</v-btn>
              <v-spacer></v-spacer>
              <v-btn depressed color="primary" @click="transferLeadership">Confirm</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Group Purchase Dialog -->
    <v-dialog v-model="isGroupPurchaseOpen" max-width="450" max-height="350">
      <v-card width="450" height="350" >
         <v-toolbar dark  dense color="primary" flat>
              <v-toolbar-title>Call Group Purchase</v-toolbar-title>
          </v-toolbar>
         <v-card-text>
           <v-textarea
                  label="Group Purchase Post"
                  v-model="groupPurchasePost"
                  required
                  class="mt-4"
                ></v-textarea>
         </v-card-text>
         
         <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text plain color="primary" @click="isGroupPurchaseOpen=false">Cancel</v-btn>
              <v-spacer></v-spacer>
              <v-btn depressed :disabled="!groupPurchasePost" color="primary" @click="callGroupPurchase">Start</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Vendor Messages Dialog -->
    <v-dialog v-model="isVendorMessageOpen" max-width="600" v-if="resident.messages.length>0">
      <v-card
        max-width="600"
        class="mx-auto"
      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>Vendor Messages</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-view-module</v-icon>
          </v-btn>
        </v-toolbar>

    <v-list three-line>
      <v-list-item-group
        active-class="pink--text"
        multiple
      >
        <template v-for="(message, index) in resident.messages">
          <v-list-item :key="index" @click="showSingleMessage(message, 'vendor')" class="ma-1">
            <!-- <template v-slot:default="{ active }"> -->
              <v-list-item-icon >
              <v-icon
                color="primary"
                v-if="!message.isRead"
                size="30"
              >
                mdi-email-outline
              </v-icon>
              <v-icon
                color="primary"
                size="30"
                v-else
              >
                mdi-email-open-outline
              </v-icon>
            </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="message.sender"></v-list-item-title>
                <v-list-item-subtitle v-text="message.title" class="d-inLine-block accent--text text-truncate"></v-list-item-subtitle>
                <v-list-item-subtitle v-text="message.text" class="d-inLine-block text-truncate"></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text >{{ $filters.convertCustomerRatingTime(message.time) }}</v-list-item-action-text>
              </v-list-item-action>
            <!-- </template> -->
          </v-list-item>

          <v-divider
            v-if="index < message.length - 1"
            :key="index"
            class="shade"
          ></v-divider>
        </template>
      </v-list-item-group>
    </v-list>
      </v-card>
    </v-dialog>


    <!-- Guild Messages Dialog -->
    <v-dialog v-model="isGuildMessageOpen" max-width="600" v-if="resident.guild&&resident.guildMessages.length>0">
      <v-card
        max-width="600"
        class="mx-auto"
      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>Guild Messages</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-view-module</v-icon>
          </v-btn>
        </v-toolbar>

    <v-list three-line>
      <v-list-item-group
        active-class="pink--text"
        multiple
      >
        <template v-for="(message, index) in resident.guildMessages">
          <v-list-item :key="index" @click="showSingleMessage(message,'guild')" class="ma-1">
            <!-- <template v-slot:default="{ active }"> -->
              <v-list-item-icon >
              <v-icon
                color="primary"
                v-if="!message.isRead"
                size="30"
              >
                mdi-email-outline
              </v-icon>
              <v-icon
                color="primary"
                size="30"
                v-else
              >
                mdi-email-open-outline
              </v-icon>
            </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="message.fullName+' ['+message.guild+']'"></v-list-item-title>
                <v-list-item-subtitle v-text="message.title" class="d-inLine-block accent--text text-truncate"></v-list-item-subtitle>
                <v-list-item-subtitle v-text="message.text" class="d-inLine-block text-truncate"></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text >{{ $filters.convertCustomerRatingTime(message.time) }}</v-list-item-action-text>
              </v-list-item-action>
            <!-- </template> -->
          </v-list-item>

          <v-divider
            v-if="index < message.length - 1"
            :key="index"
            class="shade"
          ></v-divider>
        </template>
      </v-list-item-group>
    </v-list>
      </v-card>
    </v-dialog>

    <!-- Guild Leader Dialog -->
    <v-dialog v-model="isGuildLeaderOpen" max-width="500" v-if="resident.guild">
      <v-card
        max-width="500"
        class="mx-auto"
      >
         <v-toolbar dark color="primary" flat>
                    <v-toolbar-title>Transfer Leader Remuneration&nbsp;{{ $filters.formatIntAmount(resident.guild.guildLeaderRemun) }}</v-toolbar-title>
                </v-toolbar>
                <v-card-text >
                     <v-row class="justify-center align-center flex-row d-flex" no-gutters>
                                <v-spacer/>
                                    <span class="accent--text">Transfer To Guild Leader</span>
                                   
                                    <span class="mx-1"><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{ $filters.formatIntAmount(resident.guild.guildLeaderRemun - amountToTransfer) }}</span>
                                    <v-slider
                                        :max="resident.guild.guildLeaderRemun"
                                        v-model="amountToTransfer"
                                        class="mt-5 d-inline-block"
                                        step="50"
                                        width="300"
                                    ></v-slider>
                                    <span><v-icon class="mr-1" color="silver">mdi-coin</v-icon>{{ $filters.formatIntAmount(amountToTransfer) }}</span>
                                   
                                    <v-spacer/>
                            </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn depressed class="mb-4" color="primary" @click="transfer" :disabled="amountToTransfer==0">Transfer</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Single Message Dialog -->
    <v-dialog v-model="isShowSingleMessageOpen" max-width="750" v-if="singleMessageToShow ">
      <v-card
        max-width="750"
        class="mx-auto"
      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>{{singleMessageToShow.type=='guild'?'Guild':'Vendor'}}&nbsp; Message</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="openReplyWindow">
            <v-icon>mdi-replay</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-subtitle class="accent--text text-subtitle-1 mt-3" >From:&nbsp;{{singleMessageToShow.type=='guild'?
          singleMessageToShow.message.fullName+' ['+singleMessageToShow.message.guild+']':singleMessageToShow.message.sender}}</v-card-subtitle>
       
        <v-card-subtitle class="accent--text text-subtitle-1" >Title:&nbsp;{{singleMessageToShow.message.title}}</v-card-subtitle>
        <v-divider></v-divider>
        <v-card outlined flat>
          <v-card-text class="pa-3">
            <p>{{singleMessageToShow.message.text}}</p>
          </v-card-text>
        </v-card>
        <v-card outlined flat v-if="isReplyMsgOpen">
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="replyMessage"
                placeholder="Reply Message"
                required
                filled
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon :disabled='!replyMessage' @click="reply" class="ma-2"><v-icon size="36" color="primary" >mdi-send-outline</v-icon></v-btn>
          </v-card-actions>
        </v-card>

      </v-card>
    </v-dialog>

    <!-- Message Guild Member -->
    <v-dialog v-model="isMessageGuildMemberOpen" max-width="700" v-if="guildMemberToMessage">
       <v-card
        max-width="700"
        class="mx-auto"

      >
        <v-toolbar
          color="primary lighten-1"
          dark
        >
          <v-toolbar-title>Guild Message</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon @click="sendGuildMessage" :disabled="!guildMessageText">
            <v-icon size="30">mdi-send-outline</v-icon>
          </v-btn>
        </v-toolbar>
       
        <v-card-subtitle class="accent--text text-subtitle-1 mt-3" >From:&nbsp;{{resident.nickName+' ['+resident.guild.guildFullName+']'}}</v-card-subtitle>
        <v-card-subtitle class="accent--text text-subtitle-1" >To:&nbsp;{{guildMemberToMessage.nickName+' ['+resident.guild.guildFullName+']'}}</v-card-subtitle>
         <v-card-text>
          <v-text-field
          label="Title"
          dense
          type="text"
          v-model="guildMessageTitle"
          clearable
        >
        </v-text-field>
         </v-card-text>
        <v-card  flat >
          <v-card-text>
              <v-textarea
                shaped
                auto-grow
                v-model="guildMessageText"
                filled
                placeholder="Text"
                clearable
                lg='12'
              ></v-textarea>
          </v-card-text>
        </v-card>

      </v-card>
    </v-dialog>

    <!-- AI Chat Window -->
    <v-dialog v-model="isAIChatOpen" width="710">
      <v-card flat width="700" class="pa-2">
        <v-card-text>
              <div  ref="aichat"  style="overflow: scroll; height: 500px;  background-color: #FAFAFA;">
                          <v-list three-line>
                                        <v-list-item
                                          v-for="(item, index) in chatHistoryFormatted"
                                          :key="index"
                                          :class="item.role=='assistant' ? 'float-left' : 'float-right'"
                                        >
                                          <v-list-item-avatar v-if="item.role=='assistant'">
                                            <v-img :src="petUrl" contain></v-img>
                                          </v-list-item-avatar>

                                          <v-list-item-content>
                                            <v-list-item-subtitle >{{item.content}}</v-list-item-subtitle>
                                          </v-list-item-content>

                                          <v-list-item-avatar v-if="item.role=='user'">
                                            <v-img :src="resident.avatarPic" contain></v-img>
                                          </v-list-item-avatar>

                                        </v-list-item>
                                  </v-list>
                        </div>
        </v-card-text>
      <v-card-actions>
        <v-row class="d-flex justify-center align-center my-2 pa-2">
          <v-col cols="11">
            <v-text-field
              placeholder="message"
              v-model="AIPrompt"
              dense
              :disabled='isAIThinking'></v-text-field>
          </v-col>
          <v-col cols="1" class="ml-n3">
            <v-btn :disabled='!AIPrompt || isAIThinking' @click="chatToBot" text plain :loading='isAIThinking' >
              <v-icon large color="primary">mdi-send-outline</v-icon>
              <span slot="loader" class="custom-loader">
                        <v-icon>cached</v-icon>
                      </span>
              </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      </v-card>
      
    </v-dialog>

    <!-- Loading Spinner -->
    <v-row>
      <v-dialog v-model="clientPreviewLoading" persistent fullscreen>
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

    <!-- Commit Guild Deal Loading Spinner -->
    <v-row>
      <v-dialog v-model="commitGuildDealLoading" persistent fullscreen>
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

    <!--Welfare Distribution Loading Spinner -->
    <v-row>
      <v-dialog v-model="distributeWelfareLoading" persistent fullscreen>
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

  <!-- Snack Bar -->
     <v-snackbar
        v-model="snackbar"
        centered
        dark
        color="primary lighten-2"
        class="pa-3"
        timeout="3000"
        >
        <span class="text-h6 font-weigth-bold text-center d-block">{{snackbarInfo}}</span>
     </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

import { CHECK_GUILD_NAME, 
         GET_CURRENT_RESIDENT, 
         GET_NEWS, 
         GET_SELECTED_FLYER_CLIENT_VIEW,
         GET_AI_RESPONSE } from "../queries/queries_query";
import { ALLY_GUILD, 
          KICK_GUILD_MEMBER, 
          PROMOTE_GUILD_MEMBER, 
          REWARD_GUILD_MEMBER, 
          DISALLY, 
          READ_MESSAGE, 
          TRANSFER_GUILD_LEADER_REMUN,
          DISTRIBUTE_WELFARE, 
          EDIT_GUILD,
          TRANSFER_GUILD_LEADERSHIP,
          CALL_GROUP_PURCHASE,
          CRACK_EGG } from "../queries/queries_mutation"
import MemberLocationMap from "@/components/MemberLocationMap.vue";

import { eventBus_feedPet, eventBus_stashFlyer, eventBus_crackEgg } from "../eventBus";
import _ from "lodash";
import moment from "moment"
// import { mdiHandCoin } from '@mdi/js';


import { MESSAGE_RECEIVED, FLYER_ADDED, GUILD_DEAL_TRANSACTION_ADDED } from '../queries/queries_subscription';

export default {
  components:{
    MemberLocationMap
  },
  data() {
    return {
      activeFlyerSelected: null,
      activeAllGuildDeals: [],
      AIPrompt: '',
      amountToTransfer: 0,
      dealsCommited: [],
      filterDealByCate: null,
      feedMe: true,
      distributeWelfareLoading: false,
      chatHistory: [['assistant', 'My lord, what can I do for you?']],
      contributionRatio: "%2",
      eggTranStart: false,
      exitDialogue: false,
      expanded: [],
      errorMessageFull: "",
      errorMessageShort: "",
      flyerOpen: false,
      flyerStashedOpen: false,
      flyersUnread: 0,
      groupPurchasePost: null,
      guildChose: null,
      guildFullName: "",
      guildLogoChoice: "",
      // guildLogo: '',
      guildOwned: null,
      guildMemberLocation: [],
      guildMemberToMessage: null,
      guildMessageTitle: ' ',
      guildMessageText: null,
      guildPerkSelection: ['5%', '10%'],
      guildContributionRatio: ['2%','5%', '10%'],
      guildPost: "",
      guildPostDisplay: "",
      guildPostRules: [(post) => !!post || "Guild Post is Required!"],
      guildRank:[1,2,3,4],
      guildSelected: [],
      guildShortName: "",
      guildToAlly: null,
      guildTransactions: [],
      guildTransactionTotal : 0,
      guildMessageCount: 0,
      guildNameRules: [(name) => !!name || "Guild Name is required!"],
    //   icons: {
    //   mdiHandCoin
    // },
      headers: [
        { text: "Logo", value: "actions", align: "left", sortable: false },
        { text: "Vendor", value: "businessTitle", align: "left" },
        { text: "Business Category", value: "businessCategory", align: "left" },
      ],
      stashedFlyerHeaders: [
        { text: "Logo", value: "logo", align: "left", sortable: false },
        { text: "Vendor", value: "vendor", align: "left" },
        { text: "Title", value: "flyerTitle", align: "start", sortable: true },
        { text: "Type", value: "flyerType" },
        { text: "Promotion", value: "promoInfo" },
        { text: "From", value: "dateFrom" },
        { text: "To", value: "dateTo" },
      ],
      // filter: {},
      flyerHeaders: [
        { text: "Title", value: "flyerTitle", align: "start", sortable: true },
        { text: "Type", value: "flyerType" },
        { text: "Promotion", value: "promoInfo" },
        { text: "From", value: "dateFrom" },
        { text: "To", value: "dateTo" },
      ],
      indexOfdealSelected: [],
      isAllyGuildOpen: false,
      isAIChatOpen: false,
      isAIThinking: false,
      isEditGuildOpen: false,
      isEggCracked: false,
      isGuildFormOk: false,
      isEditGuildFormOk: false,
      isGuildDealsOpen: false,
      isGroupPurchaseOpen: false,
      isGuildTransactionOpen: false,
      isJoinGuildOpen: false,
      isMyGuildOpen: false,
      isMemberLocationOpen: false,
      isStartGuildOpen: false,
      isRewardWindowOpen: false,
      isPromoteWindowOpen: false,
      isVendorMessageOpen: false,
      isGuildMessageOpen: false,
      isGuildLeaderOpen: false,
      isMessageGuildMemberOpen: false,
      isShowSingleMessageOpen: false,
      isTransferWindowOpen: false,
      isReplyMsgOpen: false,
      isrReferDealOpen: false,
      isWelfareOpen: false,
      itemsPerPage: 8,
      lastChildofChatHistory: null,
      mouseEnter: false,
      memberSelected: null,
      messageCount: 0,
      perk: '5%',
      previewDiaOpen: false,
      replyMessage: null,
      search: "",
      searchStatus: "",
      selected: [],
      singleMessageToShow: null,
      singlePageOpen: false,
      singlePage: "",
      silverToReward: 0,
      silverForWelfare: 0,
      sortDesc: true,
      sortBy: "dateFrom",
      snackbar: false,
      snackbarInfo: null,
      stashIsOn: true,
      stashTranStart: false,
      viewportHeight: 0,
      viewportWidth: 0,
      targetWidth_Pet: 120,
      targetHeight_Pet: 120,
      targetWidth_Safe: 120,
      targetHeight_Safe: 120,
      targetWidth_Guild: 100,
      targetHeight_Guild: 100,
      targetWidth_Mailbag: 100,
      targetHeight_Mailbag: 100,
      tranStart: false,
      ratio: 1.25,
      rewardSilver: 0,
      page: 1,
      petUrl: null,
      petItems: [
        { title: "Experience", icon: "mdi-trophy-award" },
        { title: "Talk to me", icon: "mdi-account-tie-voice" },
        // { title: "Click Me" },
        // { title: "Click Me 2" },
      ],
      processedActiveFlyers: null,
      regions: ['Oshawa', 
      'Whitby', 
      'Etobicoke',
      'Ajax', 
      'Pickering', 
      'North York', 
      'York', 
      'East York', 
      'Scarborough', 
      'Toronto', 
      'Markham', 
      'Richmond Hill', 
      'Newmarket', 
      'Thronehill', 
      'Mississauga', 
      'Brampton', 
      'Aurora', 
      'Vaughan'].sort(),

      taxTable:[
        {city: "Toronto", tax: 20},
        {city: "Oshawa", tax: 2},
        {city: "Scarborough", tax: 6},
        {city: "Whitby", tax: 5},
        {city: "North York", tax: 8},
        {city: "East York", tax: 8},
        {city: "Mississauga", tax: 8},
        {city: "York", tax: 8},
        {city: "Markham", tax: 8},
        {city: "Richmond Hill", tax: 7},
      ],
      rank: null,
      governorItems: [
        {title: "Welfare", icon: "mdi-coin"},
        {title: "Declare War", icon: "mdi-sword-cross"},
        {title: "Ally With City", icon: "mdi-account-multiple-plus"},
        ],
      mailbagItems: [
        { title: "Flyers", icon: "mdi-newspaper" },
        { title: "Orders", icon: "mdi-newspaper-variant-multiple-outline" },
        // { title: "Messages", icon: "mdi-message-processing-outline" },
      ],
      safeItems: [
        { title: "Stashed Flyers and Coupons", icon: "mdi-newspaper" },
        { title: "Silver", icon: "mdi-coin" },
        // { title: "Click Me" },
      ],
      snackBar: null,
      guildItems: [
        { title: "Allies", icon: "mdi-account-group-outline" },
        { title: "Start Guild", icon: "mdi-account-multiple-check-outline" },
        { title: "Join  Guild", icon: "mdi-account-multiple-plus-outline" },
        { title: "My Guild", icon: "mdi-account-supervisor-outline" },
        { title: "Guild Deals", icon: "mdi-file-document-edit" },
        { title: "Edit Guild", icon: "mdi-pencil" },
        { title: "Locate Guild Members", icon: "mdi-map-marker-multiple-outline" },
        { title: "Quit Guild", icon: "mdi-exit-run"}
      ],
      guildManageItems: [
        {title: "Promote", icon: "mdi-stairs-up"},
        {title: "Reward", icon: "mdi-currency-twd"},
        {title: "Shift Leadership", icon: "mdi-account-switch"},
        {title: "Kick Out", icon: "mdi-karate"}
      ],
      guildLeaderItems: [
        {title: "Pay Leader", icon: "mdi-cash-multiple"},
        {title: "Call Group Purchase", icon: "mdi-group"},
       
      ],
      vendor: null,
    };
  },

   apollo: {
    $subscribe: {
      guildDealTransactionAdded:{
        query: GUILD_DEAL_TRANSACTION_ADDED,
        result({data}) {
          console.log(data)
          const { guildDealTransactionAdded: tran } = data
          
          if(this.guildDealsStatus.length > 0) {
            const index = this.guildDealsStatus.findIndex(item => item.vendor == tran.vendor )
            if(index >= 0) {
              this.guildDealsStatus[index].transactions.push(tran)
              this.$store.commit("setGuildDealStatus", this.guildDealsStatus)
            }
          }
        }
      },
      // messageReceived: {
      //   query: MESSAGE_RECEIVED,
      //   result({ data }) {
      //     console.log(data.messageReceived);
      //     const { messageReceived } = data
          
      //     if( messageReceived.receiverType == 'resident' && messageReceived.receiver == this.resident.residentName && !messageReceived.guild) {
      //        let newResident = this.resident
      //        newResident.messages.push(messageReceived)
      //        this.$store.commit("setResident", newResident)
      //    }
      //     if( messageReceived.receiverType == 'resident' && messageReceived.receiver == this.resident.residentName && messageReceived.guild) {
      //        let newResident = this.resident
      //        newResident.guildMessages.push(messageReceived)
      //        this.$store.commit("setResident", newResident)
      //    }
      //   }
      // },
      flyerAdded: {
        query: FLYER_ADDED,
        result({ data }) {
          console.log(data );
          const { flyerAdded: { 
                  businessTitle,
                  flyerId,
                  flyerTitle,
                  flyerType,
                  dateFrom,
                  dateTo,
                  promoInfo,
                  crossBoundary,
                  targetDistribute}} = data

                  const index = this.processedActiveFlyers.findIndex(item => item.businessTitle == businessTitle)
                  if(index >= 0) {
                    this.processedActiveFlyers[index].vendorActiveFlyer.push({
                                                                          flyerId,
                                                                          flyerTitle,
                                                                          flyerType,
                                                                          dateFrom,
                                                                          dateTo,
                                                                          promoInfo,
                                                                          crossBoundary,
                                                                          targetDistribute})
                    this.checkReadStatus()
                    }
        }
      }
    }
  },


  created() {
    this.$store.dispatch("getGuildLogos");
    // this.$store.dispatch("getAllGuilds");
    // this.$store.dispatch("getAllGuildDeals");
   

    eventBus_stashFlyer.$on("stashFlyer", value => {
      this.stashTranStart = true
      setTimeout(() => {
        this.stashTranStart = false;
      }, 200);
    })
    

    eventBus_feedPet.$on("feedPet", (reward) => {
      this.petRewardExperience = reward.petRewardExperience;
      this.rewardSilver = reward.silver;
      this.tranStart = true;
      setTimeout(() => {
        this.tranStart = false;
      }, 200);
    });

    eventBus_crackEgg.$on("crackEgg", (reward) => {
      this.rewardSilver = reward.silver;
      this.eggTranStart = true;
      setTimeout(() => {
        this.eggTranStart = false;
      }, 500);
    });
  },

mounted() {

   let i = 0
      setInterval(() => {
      this.feedMe = !this.feedMe
      }, 2000);

  //  console.log(this.activeFlyerList)
    if(!this.mergeIsDone) this.mergedActiveFllyerList()
    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
    // console.log(this.viewportHeight);
    // console.log(this.viewportWidth);
    this.petUrl = this.resident.pet.petImgUrl;
    // this.updateGuildLogo()
    // console.log(this.activeFlyerList)
    // console.log(this.guildDealsStatus)
    if(this.resident.guildOwned) {
      const { guildFullName, guildShortName, perk, contributionRatio, guildPost, guildLogo } = this.resident.guild
      this.guildFullName = guildFullName
      this.guildShortName = guildShortName
      this.perk = perk * 100 + '%'
      this.guildLogoChoice = guildLogo
      this.contributionRatio = contributionRatio * 100 + '%'
      this.guildPost = guildPost
      
    }
    console.log(this.guildDealsStatus)
    if (this.guildDealsStatus.length > 0) {
        let ok;
        let activeDeals = []
        this.allGuildDeals.map((deal) => {
          const index = _.findIndex(this.guildDealsStatus, (item) => {
            console.log(item.guildDealId)
            console.log(deal._id)
            return (item.guildDealId == deal._id);
          });
          if (index < 0) {
            ok = true;
            activeDeals.push(deal)
          } 
        });
        console.log(activeDeals)
        if(activeDeals.length>0) this.activeAllGuildDeals = [...activeDeals]
        

      } else {
        console.log(this.allGuildDeals)
        this.activeAllGuildDeals =  [...this.allGuildDeals];
      }
      console.log(this.activeAllGuildDeals.length)
    
    this.filterActiveFlyers();
    // console.log(this.activeFlyerList)
    // console.log(this.resident)
     if(this.resident.guild&&this.resident.guild.guildMembers.length>0){
       let list = []
        for( let item of this.resident.guild.guildMembers){
          if(item.lat&&item.lng){
            list.push({
              name: item.nickName,
              lat: item.lat,
              lng: item.lng
            })
          }
        }
        // console.log(list)
       this.guildMemberLocation = [...list]
      }
    console.log(this.guildMemberLocation);
  },

  computed: {
    ...mapGetters([
      "resident",
      "pets",
      "navbarHeight",
      "activeFlyerList",
      "clientPageView",
      "clientPreviewLoading",
      "commitGuildDealLoading",
      "guildLogos",
      "guilds",
      "allGuildDeals",
      "guildDealsStatus",
      "mergeIsDone",
      "viewPortDimension",
      "cityHall",
      "restaurantCategories"
    ]),

    
    // activeAllGuildDeals() {
    //   if (this.guildDealsStatus.length > 0) {
    //     let ok;
    //     const activeDeals = this.allGuildDeals.map((deal) => {
    //       const index = _.findIndex(this.guildDealsStatus, (item) => {
    //         return (item.guildDealId == deal._id);
    //       });
    //       if (index < 0) {
    //         ok = true;
    //         return deal;
    //       }
    //     });
    //     // console.log(activeDeals)
    //     return ok ? activeDeals : false;
    //   } else {
    //     // console.log(this.allGuildDeals)
    //     return this.allGuildDeals;
    //   }
    // },

    allies(){
      // console.log('allies',this.resident.guild.allies)
      let alliesString = ''
      if(this.resident.guild.allies.length>0){
        this.resident.guild.allies.map(item => {
          alliesString = alliesString + `[${item.guildFullName}] `
        })
        return alliesString
      } else {
        return ''
      }
    },

    chatHistoryFormatted(){
      return  this.chatHistory.map(([role, content]) => ({
        role,
        content,
      }));
    },

    guildLeader(){
      if(this.resident.guild){
        const {guild: { guildLeader, guildMembers}} = this.resident
        const index = _.findIndex(guildMembers, member => {
          return guildLeader == member.name
        })
        
        if(index >= 0){
          return guildMembers[index].nickName
        }
      }
    },

   guildLogo(){
     if (this.resident) {
        if (this.resident.guild != null) {
        //  this.guildLogo = 
         return `/guildLogos/${this.resident.guild.guildLogo}`;
        } else {
          // this.guildLogo = 
          return "/static/st_small_507x507-pad_600x600_f8f8f8-removebg-preview.png";
        }
        // console.log(this.guildLogo)
      }
   },

    // guildMemberLocation(){
    //   if(this.resident.guild.length>0){
    //     let list = []
    //     for( let item of this.resident.guild){
    //       if(item.lat&&item.lng){
    //         list.push({
    //           name: item.nickName,
    //           lat: item.lat,
    //           lng: item.lng
    //         })
    //       }
    //     }
    //     console.log('guildMemberLocation',list)
    //     return list
    //   } else {
    //     console.log('guildMemberLocation',list)
    //     return []
    //   }
    // },

    myRank(){
      if(this.resident.guild){
        const index = this.resident.guild.guildMembers.findIndex(item => item.name == this.resident.residentName)

        return this.resident.guild.guildMembers[index].rank
      }
    },

    myMight(){
      if(this.resident.guild){
        const index = this.resident.guild.guildMembers.findIndex(item => item.name == this.resident.residentName)

        return this.resident.guild.guildMembers[index].might
      }
    },

    newMessages(){
      this.messageCount = 0
      this.guildMessageCount = 0
      this.resident.messages.forEach(item => {
        if(!item.isRead) this.messageCount++
      });
      this.resident.guildMessages.forEach(item => {
        if(!item.isRead) this.guildMessageCount++
      });
      return this.messageCount + this.guildMessageCount
    },

    numberOfPages() {
      return Math.ceil(this.allGuildDeals.length / this.itemsPerPage);
    },

    processedStashedFlyers(){
      const list = []
      for ( let flyer of this.resident.stashedFlyers ) {
         if(flyer.flyerType == 'COUPON'){
                  const indexUsed = this.resident.usedCoupons.findIndex( item => item.flyerId == flyer.flyerId )
                  if (indexUsed < 0 ) { list.push(flyer) }
                } else {list.push(flyer) }
      }
      return list
    },

    processedGuildMembers(){
      // console.log(this.resident.guild)
      return this.resident.guild.guildMembers.map(member=>{
        let cMon = 0
        let pMon = 0
        const index = this.resident.guild.currentMonthContribution.findIndex(item => member.name == item.name)
        if (index >=0){
          cMon = this.resident.guild.currentMonthContribution[index].amount
        }
        const indexL = this.resident.guild.previousMonthContribution.findIndex(item => item.name == member.name)
         if (indexL >=0){
          pMon = this.resident.guild.previousMonthContribution[indexL].amount
        }
        return {...member, contriCurrent: cMon, contriLast: pMon}
      })
      
    },

    propertyTax(){
      const index = this.taxTable.findIndex(item => item.city == this.resident.mailCity)
      if(index >= 0) {
        return `[${this.resident.mailCity}] ${this.taxTable[index].tax}silver/day`
      } else {
        return 0
      }
    }
  
  },
  watch: {
    dealsCommited(val) {
      console.log(val);
    },

    guildDealsStatus(val) {
      // console.log(val)
    },
  
  filterDealByCate(val){
    if(val != null){
      let list = []
      // this.allGuildDeals.map(deal => {
      //   if(deal.vendorCategory == val) {
      //     list.push(deal)
      //   }
      // })
     this.allGuildDeals.map(item => {
      //  cons.forEach(element => {
         if(_.words(item.vendorCategory).includes(val) || item.vendorCategory.includes(val)) {
          //  console.log(item)
           list.push(item)
          //  console.log(list)
         }
      //  });
     })
      this.activeAllGuildDeals = [...list]
    } else {
      this.activeAllGuildDeals = [...this.allGuildDeals]
    }
  }
    
  },

  methods: {

    allyGuild(){
       const { guild } = this.resident
        if(guild.allies&&guild.allies.length>=0){
          this.resident.guild.allies.push({guildFullName:this.guildToAlly, request: false})
        } else {
          this.resident.guild = {...this.resident.guild, allies: [{guildFullName:this.guildToAlly, request: false}]}
          }
      this.snackbarInfo = `Allied with ${this.guildToAlly}`
      this.snackbar = true

      this.$apollo
        .mutate({
          mutation: ALLY_GUILD,
          variables: { guildAsk: guild.guildFullName, guildAccept: this.guildToAlly}
        })
        .then(({data})=> {
          console.log(data)
        })
        .catch(err=>console.error(err))
    },

    canReward(name){
      const index = this.resident.guild.guildMembers.findIndex(item => item.name == name)
      if(this.resident.guild.guildMembers[index].lastRewardDate == '') return true
      const startTime = moment(new Number(this.resident.guild.guildMembers[index].lastRewardDate))
      const endTime = moment(Date.now())
      console.log(endTime.diff(startTime, 'days'))
      return endTime.diff(startTime, 'days') > 30 
      // && item.isFood
    },

    chatToBot(){
      this.chatHistory.push(['user', this.AIPrompt]);
      this.AIPrompt = ''
      const messages = this.chatHistory.map(([role, content]) => ({
        role,
        content,
      }));

      // Add latest user input
      messages.push({ role: 'user', content: this.AIPrompt });
      console.log(messages)
      this.isAIThinking = true
      this.$apollo
        .query({
          query: GET_AI_RESPONSE,
          variables: {prompt: messages}
        })
        .then(({data}) => {
          const {message} = data.getAIResponse
          
          this.chatHistory.push(['assistant', message]);
          // this.lastChildofChatHistory = this.$refs.aichat.lastElementChild
          const lastChildofChatHistory = this.$refs.aichat.lastElementChild.lastElementChild
          console.log(this.$refs.aichat)
          console.log(lastChildofChatHistory)
          lastChildofChatHistory?.scrollIntoView({ behavior: 'smooth' })
          this.isAIThinking = false
        })
        .catch(err => {
          console.error(err)
          this.isAIThinking = false
          })
          //  this.$nextTick(this.lastChildofChatHistory?.scrollIntoView({ behavior: 'smooth' }))
    },

    promoteGuildMember(){
      this.isPromoteWindowOpen = false
      this.$apollo
        .mutate({
          mutation: PROMOTE_GUILD_MEMBER,
          variables: {
            guild: this.resident.guild.guildFullName,
            resident: this.memberSelected.name,
            newRank: this.rank
          },
          update:(cache, {data: {promoteGuildMember}}) => {
            const  data = cache.readQuery({ query: GET_CURRENT_RESIDENT })
            const index = _.findIndex(data.getCurrentResident.guild.guildMembers, member => {
              return member.name == this.memberSelected.name
            } )
            if(index >= 0){
              data.getCurrentResident.guild.guildMembers[index].rank = this.rank
              cache.writeQuery({ query: GET_CURRENT_RESIDENT, data})
            }
          },
          refetchQueries:[{ query: GET_CURRENT_RESIDENT}],
          awaitRefetchQueries: true
        })
        .then(({data})=>{
          console.log(data)
        })
        .catch(err=>console.error(err))
    },

    callGroupPurchase(){
      this.$apollo
        .mutate({
          mutation: CALL_GROUP_PURCHASE,
          variables: {
            newsTitle: `[${this.resident.guild.guildFullName}] called Group Purchase`,
            headLine: this.groupPurchasePost,
            date: Date.now().toString()
          },
          update:(cache,{data:{callGroupPurchase}})=>{
            const data = cache.readQuery({query: GET_NEWS})
            // console.log(data)
            // console.log(callGroupPurchase)
            // data.getNews.push(callGroupPurchase)
            const list = [...data.getNews]
            console.log(list)
            list.push({
            newsTitle: `[${this.resident.guild.guildFullName}] called Group Purchase`,
            headLine: this.groupPurchasePost,
            date: Date.now().toString()
          })
          // data.getNews.push(callGroupPurchase)
          // cache.writeQuery({query: GET_NEWS, data})
          this.$store.commit("setNews",list)
          },
          // refetchQueries:[{query: GET_NEWS}],
          // awaitRefetchQueries: true
        })
        .then(({data})=>{
          console.log(data)
          this.isGroupPurchaseOpen = false
          this.groupPurchasePost = ''
        })
        .catch(err => console.error(err))
    },

    checkGuildName(guildNameType) {
      if (this.guildFullName || this.guildShortName) {
        this.errorMessageFull = "";
        this.errorMessageShort = "";
        // console.log(this.guildFullName)
        const variables = {
          guildName:
            guildNameType == "fullName"
              ? this.guildFullName
              : this.guildShortName,
          nameType: guildNameType,
        };
        // console.log(variables)
        this.$apollo
          .query({
            query: CHECK_GUILD_NAME,
            variables,
          })
          .then(({ data }) => {
            // console.log(data);

            const { checkGuildName } = data;
            if (!checkGuildName.guildNameIsOk && guildNameType == "fullName") {
              this.errorMessageFull = "This Guild Full Name Has Been Taken";
            } else if (
              !checkGuildName.guildNameIsOk &&
              guildNameType == "shortName"
            ) {
              this.errorMessageShort = "This Guild Short Name Has Been Taken";
            }
          })
          .catch((err) => console.log(err));
      }
    },

    chooseGuild(guild) {
      this.guildChose = guild;
      // console.log(this.guildChose);
    },

    close() {
      this.isGuildDealsOpen = this.exitDialogue = false;
      this.dealsCommited = [];
    },

    commit() {
      // console.log(this.indexOfdealSelected)
      for(let item of this.dealsCommited) {
        const index = _.findIndex(this.activeAllGuildDeals, deal => {
          return deal._id == item
        })
        
        if(index>=0) this.activeAllGuildDeals.splice(index, 1)
      }
      
      const input = {
        guildFullName: this.resident.guild.guildFullName,
        guildDealIds: this.dealsCommited,
      };
      this.$store.dispatch("commitGuildDeals", { input });
      this.dealsCommited = [];
    },

     disally(guildFullName){
       const { guild } = this.resident
        const i = guild.allies.findIndex(item => item.guildFullName == guildFullName)
        this.resident.guild.allies.splice(i, 1)
      this.snackbarInfo = `Disallied with ${guildFullName}`
      this.snackbar = true

      this.$apollo
        .mutate({
          mutation: DISALLY,
          variables: { guildAsk: guild.guildFullName, guildAccept: guildFullName}
        })
        .then(({data})=> {
          console.log(data)
        })
        .catch(err=>console.error(err))
    },

    crackEgg(){
      this.isEggCracked = true
      eventBus_crackEgg.$emit("crackEgg", {
        silver: 100,
      });

      this.resident.silverCoins += 100
      this.$store.commit('setResident', this.resident)

      this.$apollo
        .mutate({
          mutation: CRACK_EGG,
          variables: { resident: this.resident.residentName, silver: 100}
        })
        .then(({data})=> {
          console.log(data)
        })
        .catch(err=>console.error(err))

    },

    feedPet(stashOrActive) {
      eventBus_feedPet.$emit("feedPet", {
        silver: 30,
        petRewardExperience: 100,
      });
     
     if(stashOrActive == 'Stash') {
       const i = _.findIndex(this.resident.stashedFlyers, flyer => {
         return flyer.flyerId == this.activeFlyerSelected.flyerId
       })
       const list = [...this.resident.stashedFlyers]
       list.splice(i, 1)
       this.resident.stashedFlyers = [...list]
        this.$store.commit('setResident', this.resident)
     } else {
        // console.log(this.processedActiveFlyers)
    const  processedFlyers = this.processedActiveFlyers.map((item) => {
        let vendorActiveFlyer = []
        for(let flyer of item.vendorActiveFlyer) {

          if (flyer.flyerId !== this.activeFlyerSelected.flyerId){
            vendorActiveFlyer.push({
              flyerId: flyer.flyerId,
              flyerTitle: flyer.flyerTitle,
              flyerType: flyer.flyerType,
              dateFrom: flyer.dateFrom,
              dateTo: flyer.dateTo,
              promoInfo: flyer.promoInfo,
              crossBoundary: flyer.crossBoundary,
              targetDistribute: flyer.targetDistribute})
          }
        }
        return {
                businessCategory: item.businessCategory,
                businessTitle: item.businessTitle,
                logo: item.logo,
                vendorActiveFlyer
                }
     })
     this.processedActiveFlyers = null
     this.processedActiveFlyers = processedFlyers
    //  console.log(this.processedActiveFlyers)
     }
    
      this.$store.dispatch("feedPet", {
        residentName: this.resident.residentName,
        flyerId: this.activeFlyerSelected.flyerId,
        targetDistribute: this.activeFlyerSelected.targetDistribute,
        petExperienceGained: 100,
        silverRewarded: 40,
        stashOrActive,
      });
      this.previewDiaOpen = false;
      // this.resident.silverCoins += 40
      // this.resident.petExperience += 100
      
    },

    filterActiveFlyers() {
      console.log(this.activeFlyerList)
     
        this.processedActiveFlyers =  this.activeFlyerList.map((item) => {
            let vendorActiveFlyer = []
            // console.log(item)
             for (let flyer of item.vendorActiveFlyer)  {
                
                if(flyer.flyerType == 'COUPON'){
                  const indexUsed = this.resident.usedCoupons.findIndex( item => item.flyerId == flyer.flyerId )
                  if (indexUsed >= 0 ) { continue }
                }
                const index = _.findIndex(
                  this.resident.stashedFlyers,
                  (stashedFlyer) => {
                    return flyer.flyerId == stashedFlyer.flyerId;
                  }
                );
               

                if (
                  index < 0 &&
                  !this.resident.flyersFedToPet.includes(flyer.flyerId) && (this.resident.outsideBoundary ? flyer.crossBoundary : true)
                ) {
                  vendorActiveFlyer.push(flyer)
                } 
              };
              // console.log(vendorActiveFlyer)
              return {
                businessCategory: item.businessCategory,
                businessTitle: item.businessTitle,
                logo: item.logo,
                vendorActiveFlyer
                }
            });

            
      
      console.log(this.processedActiveFlyers)

      this.checkReadStatus()
    },

    checkReadStatus(){
      for (let processedFlyer of this.processedActiveFlyers) {
        for(let flyer of processedFlyer.vendorActiveFlyer) {
          const index =   this.resident.flyersRead.forEach(item => item == flyer.flyerId)
          if (index < 0) {
            this.flyersUnread++
          }
        }
      }
    },

    distributeWelfare(){
      this.isWelfareOpen = false
      this.distributeWelfareLoading = true
      this.$apollo
        .mutate({
          mutation: DISTRIBUTE_WELFARE,
          variables: {
            welfare: this.silverForWelfare,
            total: this.silverForWelfare * this.cityHall.population,
            metro: this.cityHall.metro
          },
          update: (cache,{}) => {
            this.cityHall.treasure -= (this.silverForWelfare * this.cityHall.population)
            // console.log(this.cityHall)
            this.resident.silverCoins += this.silverForWelfare
            this.$store.commit("setCityHall", this.cityHall) 
            this.$store.commit("setResident", this.resident)
          }
        })
        .then(({data}) => {
          console.log(data.distributeWelfare)
          this.distributeWelfareLoading = false
        })
        .catch(err => {
          console.error(err)
          this.distributeWelfareLoading = false

          })
    },

    editGuild(){
      this.$apollo
        .mutate({
          mutation: EDIT_GUILD,
          variables: {
            guildId: this.resident.guildOwned,
            guildFullName: this.guildFullName,
            guildShortName: this.guildShortName,
            guildLogo: this.guildLogoChoice,
            guildPost: this.guildPost,
            perk: parseInt(this.perk)/100,
            contributionRatio: parseInt(this.contributionRatio)/100
          },
          update: (cache,{data: {editGuild}}) => {
            console.log(editGuild)
            const {
                    guildFullName,
                    guildShortName,
                    guildLogo,
                    guildPost,
                    perk,
                    contributionRatio} = editGuild
            this.resident.guild.guildFullName = guildFullName
            this.resident.guild.guildShortName = guildShortName
            this.resident.guild.guildLogo = guildLogo
            this.resident.guild.guildPost = guildPost
            this.resident.guild.perk = perk
            this.resident.guild.contributionRatio = contributionRatio

            this.$store.commit("setResident", this.resident) 
          },
           optimisticResponse: {
              editGuild: {
                __typename: "GuildUpdateInfo",
                guildFullName: this.guildFullName,
                guildShortName: this.guildShortName,
                guildLogo: this.guildLogoChoice,
                guildPost: this.guildPost,
                perk: parseInt(this.perk)/100,
                contributionRatio: parseInt(this.contributionRatio)/100
              }
            }
        })
        .then(({data}) => {
          console.log(data)
          this.isEditGuildOpen = false
          // this.updateGuildLogo()
        })
        .catch(err => {
          console.error(err)

          })
    },

    formerPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    },

     updateGuildLogo() {
      if (this.resident) {
        if (this.resident.guild != null) {
         this.guildLogo =  `/guildLogos/${this.resident.guild.guildLogo}`;
        } else {
          this.guildLogo =  "/static/st_small_507x507-pad_600x600_f8f8f8-removebg-preview.png";
        }
        console.log(this.guildLogo)
      }
    },

     guildHandler(index) {
      switch (index) {
        case 0:
          this.isAllyGuildOpen = true
          break;
        case 1:
          this.isStartGuildOpen = true;
          break;
        case 2:
          this.isJoinGuildOpen = true;
          break;
        case 3:
          this.isMyGuildOpen = true;
          break;
        case 4:
          this.isGuildDealsOpen = true;
          break;
        case 6:
          this.isMemberLocationOpen = true
          break;
        case 5:
          this.isEditGuildOpen = true
          break;
        case 7:
          this.$store.dispatch('quitGuild',{ residentName: this.resident.residentName, guildFullName: this.resident.guild.guildFullName})
          this.snackbarInfo = `You left ${this.resident.guild.guildFullName}`
          this.snackbar = true
          // this.$nextTick(() => {
          //   this.updateGuildLogo()
          // });
          
      }
    },

    guildItemShow(title){
      switch(title){
        case "Allies":
          return  this.resident.guild || this.resident.guildOwned ? true : false;
        case "Start Guild":
          return  this.resident.guild || this.resident.guildOwned ? false : true;
        case "Join  Guild":
          return  this.resident.guild || this.resident.guildOwned ? false : true;
        case "My Guild" :
          return  this.resident.guild || this.resident.guildOwned ? true : false;
        case "Guild Deals" :
          return  this.resident.guild || this.resident.guildOwned ? true : false;
        case "Locate Guild Members":
          return this.resident.guildOwned ? true : false;
        case "Edit Guild":
          return this.resident.guildOwned ? true : false;
        case "Quit Guild":
          return  this.resident.guild && !this.resident.guildOwned ? true : false;
      }
    },

    handleSinglePage(item) {
      this.singlePage = item;
      this.singlePageOpen = true;
    },

    handleActiveFlyerSelected(e) {
      // console.log(e);
      const index = _.findIndex(this.resident.stashedFlyers, (flyer) => {
        return e.flyerId == flyer.flyerId;
      });
      // console.log(index);
      this.stashIsOn = index >= 0 ? false : true;
      this.activeFlyerSelected = e;
      this.flyerOpen = false;
      this.flyerStashedOpen = false;
      this.previewDiaOpen = true;
      const pos = e.flyerId.indexOf("_");
      this.vendor = e.flyerId.slice(0, pos);
      this.$store.commit("clearClientPageView");
      // this.$store.dispatch("getSelectedFlyerClientView", {
      //   flyerId: e.flyerId,
      //   businessTitle: e.flyerId.slice(0, pos),
      //   time: Date.now().toString(),
      //   resident: this.resident.residentName
      // });
      this.$store.commit("setClientPreviewLoading", true);
      this.$apollo
        .query({
          query: GET_SELECTED_FLYER_CLIENT_VIEW,
          variables: {
                      flyerId: e.flyerId,
                      businessTitle: this.vendor,
                      time: Date.now().toString(),
                      resident: this.resident.residentName
                    },
          update: (cache, {data:{getSelectedFlyerClientView}}) => {
             let newResident = this.resident
            newResident.flyersRead.push(e.flyerId)
            this.$store.commit('setResident', newResident)
            this.checkReadStatus()
          }
        })
        .then(({data})=>{
          // console.log(data)
         this.$store.commit("setClientPageView", data.getSelectedFlyerClientView);
         this.$store.commit("setClientPreviewLoading", false);
        })
        .catch(err => console.error(err))
     
    },

    handleCancel() {
      this.$refs.form.reset();
      this.isStartGuildOpen = false;
      this.isEditGuildOpen = false
    },

    isAllied(name){
      const i = this.resident.guild.allies.findIndex(item => item.guildFullName == name)
      return i >= 0 ? true : false
    },

    isRequest(name){
       const i = this.resident.guild.allies.findIndex(item => item.guildFullName == name)
        if(i >= 0){
          return this.resident.guild.allies[i].request
        }
    },

    isDisabled(title) {
      if (title == "Stashed flyers and coupons" && this.resident) {
        return this.resident.stashedFlyers &&
          this.resident.stashedFlyers.length > 0
          ? false
          : true;
      }
    },

    joinGuild() {
      // console.log(this.guildChose);
      this.$store.dispatch("joinGuild", {
        residentName: this.resident.residentName,
        nickName: this.resident.nickName,
        avatar: this.resident.avatarPic,
        guildId: this.guildChose,
        lat: this.resident.initialLat,
        lng: this.resident.initialLng
      });
      this.isJoinGuildOpen = false;
      const index = _.findIndex(this.guilds, guild => {
        return this.guildChose == guild._id
      })
      if(index >= 0){
        this.snackbarInfo = `You joined ${this.guilds[index].guildFullName}`
        this.snackbar = true
        // this.$nextTick(() => {
        //   this.updateGuildLogo()
        //   });
      }
      
    },

     leaderOrders(index){
      switch(index){
        case 0:
          this.isGuildLeaderOpen = true
          break;
        case 1:
          this.isGroupPurchaseOpen = true
          break;
      }
    },

    manageGuildMember(name, nickName, rank, index){
      this.memberSelected = {name, nickName} 

      this.rank = rank
      switch (index) {
        case 0:
          this.isPromoteWindowOpen = true
          break
        case 1:
          this.isRewardWindowOpen = true
          break
        case 2:
          this.isTransferWindowOpen = true
          break
        case 3:
          this.$apollo
            .mutate({
              mutation: KICK_GUILD_MEMBER,
              variables: {guild: this.resident.guild.guildFullName, resident: name},
              update:(cache, {})=>{
                const data = cache.readQuery({query: GET_CURRENT_RESIDENT})
                const index = _.findIndex(data.getCurrentResident.guild.guildMembers, member => {
                  return member.name == name
                })
                if(index>=0){
                  data.getCurrentResident.guild.guildMembers.splice(index, 1)
                  cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
                  this.$store.commit('setResident', data.getCurrentResident)
                }
              },
              refetchQueries:[{query:  GET_CURRENT_RESIDENT}],
              awaitRefetchQueries: true
            })
            .then(({data})=>{
              // console.log(data)
            })
            .catch(err => console.error(err))
          
          break
      }
    },

    mergedActiveFllyerList(){
      // console.log(this.resident)
      // console.log(this.activeFlyerList)
      if(this.resident.targetFlyers.length>0){
        for(let flyer of this.resident.targetFlyers){
           if(flyer.flyerType == 'COUPON'){
                  const indexUsed = this.resident.usedCoupons.findIndex( item => item.flyerId == flyer.flyerId )
                  if (indexUsed >= 0 ) { continue }
                }
          const index = _.findIndex(this.activeFlyerList, item => {
            // console.log(flyer.businessTitle)
            // console.log(item.businessTitle)
            return flyer.businessTitle == item.businessTitle
          })
          if(index >= 0) {
            this.activeFlyerList[index].vendorActiveFlyer.push({
              flyerId: flyer.flyerId,
              flyerTitle: flyer.flyerTitle,
              flyerType: flyer.flyerType,
              dateFrom: flyer.dateFrom,
              dateTo: flyer.dateTo,
              promoInfo: flyer.promoInfo,
              crossBoundary: flyer.crossBoundary,
              targetDistribute: flyer.targetDistribute
            })
          } else {
            console.log(flyer)
            let vendorActiveFlyer = []
            vendorActiveFlyer.push({
              flyerId: flyer.flyerId,
              flyerTitle: flyer.flyerTitle,
              flyerType: flyer.flyerType,
              dateFrom: flyer.dateFrom,
              dateTo: flyer.dateTo,
              promoInfo: flyer.promoInfo,
              crossBoundary: flyer.crossBoundary,
              targetDistribute: flyer.targetDistribute
            })
            // console.log(vendorActiveFlyer)
            this.activeFlyerList.push({
              businessTitle: flyer.businessTitle,
              logo: flyer.logo,
              businessCategory: flyer.businessCategory,
              vendorActiveFlyer 
            })
            // console.log(this.activeFlyerList)
          }
        }
      }
      this.$store.commit('setMergeIsDone', true)
      
    },

    messageGuildMember(member){
      // console.log(member)
      this.isMessageGuildMemberOpen = true
      this.guildMemberToMessage = member
      this.guildMessageTitle = ' '
      this.guildMessageText = null
    },

    mouseEnterSize_pet(e) {
      // console.log(e);
      this.targetWidth_Pet = e.target.offsetWidth * this.ratio;
      this.targetHeight_Pet = e.target.offsetHeight * this.ratio;
    },

    mouseLeaveSize_pet(e) {
      // console.log(e);
      this.targetWidth_Pet = e.target.offsetWidth / this.ratio;
      this.targetHeight_Pet = e.target.offsetHeight / this.ratio;
    },

    mouseEnterSize_safe(e) {
      // console.log(e);
      this.targetWidth_Safe = e.target.offsetWidth * this.ratio;
      this.targetHeight_Safe = e.target.offsetHeight * this.ratio;
    },

    mouseEnterSize_guild(e) {
      // console.log(e);
      this.targetWidth_Guild = e.target.offsetWidth * this.ratio;
      this.targetHeight_Guild = e.target.offsetHeight * this.ratio;
    },

    mouseLeaveSize_safe(e) {
      // console.log(e);
      this.targetWidth_Safe = e.target.offsetWidth / this.ratio;
      this.targetHeight_Safe = e.target.offsetHeight / this.ratio;
    },

    mouseLeaveSize_guild(e) {
      // console.log(e);
      this.targetWidth_Guild = e.target.offsetWidth / this.ratio;
      this.targetHeight_Guild = e.target.offsetHeight / this.ratio;
    },

    mouseEnterSize_mailbag(e) {
      // console.log(e);
      this.targetWidth_Mailbag = e.target.offsetWidth * this.ratio;
      this.targetHeight_Mailbag = e.target.offsetHeight * this.ratio;
    },

    mouseLeaveSize_mailbag(e) {
      // console.log(e);
      this.targetWidth_Mailbag = e.target.offsetWidth / this.ratio;
      this.targetHeight_Mailbag = e.target.offsetHeight / this.ratio;
    },

     openGovernorHandler(index) {
      switch (index) {
        case 0:
          this.isWelfareOpen = true;
          break;
        case 1:
          break;
      
      }
    },

    openReplyWindow(){
      this.isReplyMsgOpen=true
      this.replyMessage = null
    },

    openMailbagHandler(index) {
      switch (index) {
        case 0:
          this.flyerOpen = true;
          break;
        case 1:
          this.$router.push("/residentOrders");
          break;
        case 2:
          break;
      }
    },

    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },

    referDeal(){
      this.guildSelected = []
      this.isrReferDealOpen = true
    },

    reply(){

      switch(this.singleMessageToShow.type){
        case 'vendor':
          this.$store.dispatch('sendMessage', {
                sender: this.resident.residentName,
                receiver: this.singleMessageToShow.message.sender,
                receiverType: 'vendor',
                text: this.replyMessage,
                time: Date.now().toString(),
                fullName: `${this.resident.firstName} ${this.resident.lastName}`,
                title: this.singleMessageToShow.message.title,
                guild: null 
            })
            break;
          case 'guild':
            this.$store.dispatch('sendMessage', {
                sender: this.resident.residentName,
                receiver: this.singleMessageToShow.message.sender,
                receiverType: 'resident',
                text: this.replyMessage,
                time: Date.now().toString(),
                fullName: `${this.resident.firstName} ${this.resident.lastName}`,
                title: this.singleMessageToShow.message.title,
                guild: this.singleMessageToShow.message.guild
            })
            
      }

      this.isShowSingleMessageOpen = false
      this.snackbarInfo = `Reply ${this.singleMessageToShow.message.sender}`
      this.snackbar = true
    },

    rewardGuildMember(){
      this.isRewardWindowOpen = false
      this.$apollo
        .mutate({
          mutation:REWARD_GUILD_MEMBER,
          variables:{
            resident: this.memberSelected.name,
            guild: this.resident.guild.guildFullName,
            silverAmount: this.silverToReward
          },
          update:(cache, {data:{}}) => {
            const data = cache.readQuery({query: GET_CURRENT_RESIDENT})
            const silver = data.getCurrentResident.guild.guildSilver - this.silverToReward
            data.getCurrentResident.guild.guildSilver = silver 
            const index = data.getCurrentResident.guild.guildMembers.findIndex(member => member.name == this.memberSelected.name)
            data.getCurrentResident.guild.guildMembers[index].lastRewardDate = Date.now()
            cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
            this.$store.commit('setResident', data.getCurrentResident)
          },
          refetchQueries: [{ query: GET_CURRENT_RESIDENT}],
          awaitRefetchQueries: true
        })
        .then(({data})=>{
          console.log(data)
        })
        .catch(err => console.error(err))
    },

    rewardItemIcon(item) {
      const itemArray = _.split(item, "_", 2);
      // console.log(itemArray)
      return itemArray[1];
    },

    rewardItemName(item) {
      const itemArray = _.split(item, "_", 2);
      // console.log(itemArray)
      return itemArray[0];
    },

    openSafeHandler(index) {
      switch (index) {
        case 0:
          this.flyerStashedOpen = true;
          break;
        case 1:
          break;
        case 2:
          break;
      }
    },

  
    showGuildPost(post) {
      this.guildPostDisplay = post;
    },

    showGuildTransactions(transactions) {
      // console.log(transactions)
      const month = new Date().getMonth()
      // console.log(month)
      let total = 0
      this.guildTransactions = transactions.map(item => {
        // console.log(new Date(new Number(item.date)).getMonth())
        // if(new Date(item.date).getMonth() + 1 == month + 1){
          total += item.purchaseAmount
          return item
        // }
      })
      // console.log(this.guildTransactions)
      this.guildTransactionTotal = total
      this.isGuildTransactionOpen = true
    },

    showSingleMessage(message, type){
      // console.log(message)
      this.isReplyMsgOpen = false
      this.isShowSingleMessageOpen = true
      this.singleMessageToShow = { message, type}
      this.$apollo
        .mutate({
          mutation: READ_MESSAGE,
          variables: {
            sender: message.sender, 
            receiver: message.receiver, 
            guild: message.guild, 
            time: message.time, 
            type
          },
          update:(cache, {data: {readMessage}}) => {
            const  data = cache.readQuery({ query: GET_CURRENT_RESIDENT })
            // console.log(data)
            switch(type){
              case 'vendor':
                const index = _.findIndex(data.getCurrentResident.messages, item => {
                    return item.sender == message.sender && item.time == message.time
                  })
                if(index >= 0){
                  data.getCurrentResident.messages[index].isRead = true
                  this.$store.commit('setResident', data.getCurrentResident)
                  // cache.writeQuery({ query: GET_CURRENT_RESIDENT, data})
                }
                break;
              case 'guild':
                const indexGuild = _.findIndex(data.getCurrentResident.guildMessages, item => {
                    return item.guild == message.guild && item.time == message.time
                  })
                if(indexGuild >= 0){
                  data.getCurrentResident.guildMessages[indexGuild].isRead = true
                  this.$store.commit('setResident', data.getCurrentResident)

                  // console.log(data)
                  // cache.writeQuery({ query: GET_CURRENT_RESIDENT, data})
                }
            }
            this.$store.commit('setResident', data.getCurrentResident)
          },
          refetchQueries:[{ query: GET_CURRENT_RESIDENT}],
          awaitRefetchQueries: true
        })
        .then(({data})=>{
          console.log(data)
        })
        .catch(err=>console.error(err))
    },

    sendGuildMessage(){
       this.$store.dispatch('sendMessage', {
                sender: this.resident.residentName,
                receiver: this.guildMemberToMessage.name,
                receiverType: 'resident',
                text: this.guildMessageText,
                time: Date.now().toString(),
                fullName: `${this.resident.firstName} ${this.resident.lastName}`,
                title: this.guildMessageTitle,
                guild: this.resident.guild.guildFullName
            })
        this.isMessageGuildMemberOpen = false
        this.snackbarInfo = `Messaged ${this.guildMemberToMessage.nickName}`
      this.snackbar = true
    },

    stashFlyer() {
       eventBus_stashFlyer.$emit("stashFlyer", {
        
      });
      // console.log(this.activeFlyerSelected);
      for(let item of this.processedActiveFlyers) {
       
      item.vendorActiveFlyer.map((flyer, i, array) => {
        if (flyer.flyerId == this.activeFlyerSelected.flyerId) {
          array.splice(i, 1);

          this.resident.stashedFlyers.push({
                        flyerId: flyer.flyerId,
                        flyerTitle: flyer.flyerTitle,
                        flyerType: flyer.flyerType,
                        dateFrom: flyer.dateFrom,
                        dateTo: flyer.dateTo,
                        promoInfo: flyer.promoInfo,
                        logo: item.logo,
                        vendor: item.businessTitle,
                        targetDistribute: flyer.targetDistribute})


            this.$store.dispatch("stashFlyer", {
              residentName: this.resident.residentName,
              vendor: this.vendor,
              flyerId: this.activeFlyerSelected.flyerId,
              flyerTitle: this.activeFlyerSelected.flyerTitle,
              flyerType: this.activeFlyerSelected.flyerType,
              dateFrom: this.activeFlyerSelected.dateFrom,
              dateTo: this.activeFlyerSelected.dateTo,
              promoInfo: this.activeFlyerSelected.promoInfo,
              logo: item.logo,
              targetDistribute: this.activeFlyerSelected.targetDistribute
            });
          }
        });
      }
      this.previewDiaOpen = false;
    },

    startGuild() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("startGuild", {
          guildLeader: this.resident.residentName,
          guildLeaderAvatar: this.resident.avatarPic,
          guildLeaderNickName: this.resident.nickName,
          guildFullName: this.guildFullName,
          guildShortName: this.guildShortName,
          guildLogo: this.guildLogoChoice,
          guildPost: this.guildPost,
          lat: this.resident.initialLat,
          lng: this.resident.initialLng,
          perk: parseInt(this.perk)/100,
          contributionRatio: parseInt(this.contribution)/100
        });
        this.isStartGuildOpen = false;
      }
    },

    systemMessage(){
      console.log('vendor message')
    },

    toVendorInter(vendor){
      this.isGuildDealsOpen = false
      this.singlePageOpen = false
      this.$router.push({name: "vendorInterface", params: { vendor }} )
    },

    transfer(){
      // console.log(this.amountToTransfer)
      this.$apollo
        .mutate({
          mutation: TRANSFER_GUILD_LEADER_REMUN,
          variables: {
            resident: this.resident.residentName,
            guild: this.resident.guild.guildFullName,
            amount: this.amountToTransfer
          },
          update:(cache,{data:{transferGuildLeaderRemun}})=>{
            let newResident = this.resident
            newResident.silverCoins += this.amountToTransfer
            newResident.guild.guildLeaderRemun -= this.amountToTransfer
            this.$store.commit('setResident', newResident)
          }
        })
        .then(({data})=>{
          console.log(data)
          this.isGuildLeaderOpen = false
          this.amountToTransfer = 0
        })
        .catch(err => console.error(err))
    },

    transferLeadership(){
      this.$apollo
        .mutate({
          mutation: TRANSFER_GUILD_LEADERSHIP,
          variables: {
            leader: this.resident.residentName,
            member: this.memberSelected.name,
            guildId: this.resident.guildOwned
          },
          update:(cache,{data:{}})=>{
            this.resident.guildOwned = null
            this.resident.guild.guildLeader = this.memberSelected.name
            this.$store.commit('setResident', this.resident)
          }
        })
        .then(({data})=>{
          console.log(data)
          this.isTransferWindowOpen = false
        })
        .catch(err => console.error(err))
    }
  },


   beforeRouteLeave(to, from, next) {
    //  this.processedActiveFlyers = null
     this.$store.dispatch('getCurrentResident')
     next()
  },
};
</script>

<style lang="scss" scoped>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
.fade-down-enter,
.fade-down-enter-active {
  transition: all 0.5s ease;
}
.fade-down-leave-active {
  transition: all 4s cubic-bezier(1, 0.5, 0.8, 1);
}
.fade-down-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

.slide-fade-enter,
.slide-fade-enter-active {
  transition: all 0.1s ease;
}
.slide-fade-leave-active {
  transition: all 3.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-leave-to {
  transform: translate(380px, 100px);
  opacity: 0.4;
}

.slideEgg-fade-enter,
.slideEgg-fade-enter-active {
  transition: all 0.1s ease;
}
.slideEgg-fade-leave-active {
  transition: all 3.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slideEgg-fade-leave-to {
  transform: translate(780px, -10px);
  opacity: 0.3;
}
</style>
