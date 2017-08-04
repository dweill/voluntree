import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { OAuthProfile } from '../oauth/models/oauth-profile.model';
import { OAuthService } from '../oauth/oauth.service';
import { LoginPage } from '../login/login-page';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { ViewController, NavController, Platform, NavParams } from 'ionic-angular';
import { ProPubServiceProvider } from '../../providers/pro-pub-service/pro-pub-service';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import {GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';
// import { GetNpAddressrProvider } from '../../providers/get-np-addressr/get-np-addressr';
import { GrabNpEventsProvider } from '../../providers/grab-np-events/grab-np-events';
import { NpCalProvider } from '../../providers/np-cal/np-cal';
import { ModalController } from 'ionic-angular';
import { EventSelectPage } from '../event-select/event-select';
import { Storage } from '@ionic/storage';
import { VolunteerMapSearchPage } from '../volunteer-map-search/volunteer-map-search';
import { GrabBadgesProvider } from '../../providers/grab-badges/grab-badges';


/**
 * Generated class for the VolunteerDashPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

//  declare var google: any;

@Component({
  selector: 'page-volunteer-dash',
  templateUrl: 'volunteer-dash.html',
  providers: [ OAuthService, ProPubServiceProvider, Geolocation, GrabNpEventsProvider, NpCalProvider, GrabBadgesProvider]
})
export class VolunteerDashPage {
  private oauthService: OAuthService;
  profile: OAuthProfile;
  private http: Http;
  img: string;
  private map: GoogleMap;
  // map: GoogleMap;
  description: string; 
  edit: any;
  newDescription: string;
  public propublic: any;
  public npAddress: any;
  public npEvents = [];
  public finder: any;
  public results: any;
  public searched: boolean = false;
  public badgeSrc;
  public badgeName;
  public ids;
  public badgeNameArray = ['', 'Religious', 'Arts and Culture', 'Education', 'Health', 'International', 'Environmental', 'Animal'];
  public badgeSrcArray = ['', 'http://i.imgur.com/8aiTD8Pm.png', 'http://i.imgur.com/bOxoXlzm.png', 'http://i.imgur.com/myHsaZjm.png', 'http://i.imgur.com/d04Yz1rm.png', 'http://i.imgur.com/QAY8NOJm.png', 'http://i.imgur.com/OnKiTAhm.png', 'http://i.imgur.com/wGVysRPm.png'];
  constructor(private _zone: NgZone, private viewCtrl: ViewController, private geolocation: Geolocation, http: Http, public navCtrl: NavController, public navParams: NavParams, oauthService: OAuthService, public ProPubServiceProvider: ProPubServiceProvider, public platform: Platform, public GrabNpEventsProvider: GrabNpEventsProvider, public NpCalProvider: NpCalProvider, public ModalController: ModalController, public storage: Storage, public GrabBadgesProvider: GrabBadgesProvider) {
    
    this.oauthService = oauthService;
    this.http = http;    
    oauthService.getProfile()
        .then(profile => {
          this.profile = profile
          this.img = profile.photo.data.url
        })
        .then(() => {
            this.http.post('http://ec2-13-59-91-202.us-east-2.compute.amazonaws.com:3000/graphql', {
                query: `{volunteer (name: "${this.profile.firstName} ${this.profile.lastName}"){id description}}`
            }).map(data => {
              if (data.json().data.volunteer.length === 0) {
                this.http.post('http://ec2-13-59-91-202.us-east-2.compute.amazonaws.com:3000/graphql', {
                    query: `mutation {volunteer(name: "${this.profile.firstName} ${this.profile.lastName}", description: "", profile_img: "${this.img}") {id name}}`
                }).map (data => {
                let voluntId = data.json().data.volunteer[0].id;
                this.storage.set('voluntId', voluntId);
                this.description = data.json().data.volunteer[0].description;
                }).toPromise();
              } else {
                let voluntId = data.json().data.volunteer[0].id;
                this.storage.set('voluntId', voluntId);
                this.description = data.json().data.volunteer[0].description; 

                  this.GrabBadgesProvider.grabBadgeById(voluntId)
                  .then(data => {
                    alert(`${Object.keys(data)}`)
                  this.ids = data.badges_volunteer.map(function(el) {
                    // alert(`${el}`);
                    return el.badgeId;
                  });
                  // this.ids.push(data.badges_volunteer);
                  alert(`${this.ids[0]}`);
                  // badgeSrc.push(el.badgeId;
                    for (let i = 0; i < this.ids; i++) {
                      // this.badgeNameArray[this.ids[i]];
                      // this.badgeSrcArray[this.ids[i]];
                        alert(`${this.badgeNameArray[this.ids[i]]}`);
                        alert(`${this.badgeSrcArray[this.ids[i]]}`);
                    }

                });

              }
            }).toPromise();
        })
    platform.ready().then(() => {

        });
  }

  //  loadBadges(id) {
  //      this.GrabBadgesProvider.grabBadgebyId(id)
  //      .then(data => {
  //     this.propublic = data;
  //   });
  //   }

    goToVolunteerMapSearchPage(){
      this.navCtrl.push(VolunteerMapSearchPage);
    }

    logout() {
      this.navCtrl.push(LoginPage)
      .then(() => this.navCtrl.remove(this.viewCtrl.index))
    }; 

    editDescription() {
      this.edit = !this.edit
    }
  submitDescription() {
    this.http
      .post('http://ec2-13-59-91-202.us-east-2.compute.amazonaws.com:3000/graphql', {
          query: `mutation {volunteer (action: "update", name: "${this.profile.firstName} ${this.profile.lastName}", description: "${this.newDescription}") {description}}`
      })
      .map(data => {
          this.edit = !this.edit
          this.description = data.json().data.volunteer.description
      })
      .map(() => {

      })
      .toPromise()
  };

  
};
