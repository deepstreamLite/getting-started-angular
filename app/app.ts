import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, Component, OnInit, Injectable } from '@angular/core';
declare var deepstream: any;

@Injectable()
class DsService {
  get dsInstance() {
    return deepstream('wss://154.deepstreamhub.com?apiKey=97a397bd-ccd2-498f-a520-aacc9f67373c').login()
  }
}

/******************
 * Datastore (Record)
 *****************/
@Component({
  selector: 'my-record',
  template: `
  	<div class="group realtimedb">
  		<h2>Realtime Datastore</h2>
  		<div class="input-group half left">
  			<label>Firstname</label>
  			<input type="text" id="firstname" [ngModel]="firstname" (ngModelChange)="handleFnameChange($event)" />
  		</div>
  		<div class="input-group half">
  			<label>Lastname</label>
  			<input type="text" id="lastname" [ngModel]="lastname" (ngModelChange)="handleLnameChange($event)" />
  		</div>
  	</div>
  `
})
class RecordComponent implements OnInit{
  firstname;
  lastname;
  record;

  constructor(private dsService: DsService){}

  ngOnInit() {
    this.record = this.dsService.dsInstance.record.getRecord('test/johndoe')
    this.record.subscribe((val) => {
      this.firstname = val.firstname;
      this.lastname = val.lastname;
    })
  }

  handleFnameChange(val){
    this.record.set('firstname', val);
  }
  handleLnameChange(val) {
    this.record.set('lastname', val);
  }
}


/******************
 * PubSub (Events)
 *****************/
@Component({
  selector: 'my-events',
  template: `
    <div class="group pubsub">
      <div class="half left">
        <h2>Publish</h2>
        <button class="half left" id="send-event" (click)="handleClick()">Send test-event with</button>
        <input type="text" class="half" id="event-data" [(ngModel)]="value"/>
      </div>
      <div class="half">
        <h2>Subscribe</h2>
        <ul id="events-received">
          <li *ngFor="let event of eventsReceived">{{event}}</li>
        </ul>
      </div>
    </div>
  `
})
class EventsComponent implements OnInit {
  value = '';
  eventsReceived = [];

  constructor(private dsService: DsService){}

  ngOnInit() {
    this.dsService.dsInstance.event.subscribe('test-event', (val) => {
      this.eventsReceived.push(val);
    })
  }

  handleClick() {
    console.log(this.value)
    this.dsService.dsInstance.event.emit('test-event', this.value);
  }
}


/******************
 * Req/Res (RPC)
 *****************/ 
@Component({
  selector: 'my-rpc',
  template: `
    <div class="group reqres">
      <div class="half left">
        <h2>Request</h2>
        <button class="half left" id="make-rpc" (click)="handleClick()">Make multiply request</button>
        <div class="half">
          <input type="text" id="request-value" class="half left" value="3" [(ngModel)]="requestValue"/>
          <span class="response half item" id="display-response">{{displayResponse}}</span>
        </div>
      </div>
      <div class="half">
        <h2>Response</h2>
        <div class="half left item">Multiply number with:</div>
        <input type="text" value="7" class="half" id="response-value" [(ngModel)]="responseValue" />
      </div>
    </div>
  `
})
class RPCComponent implements OnInit {
  requestValue = '3';
  responseValue = '7';
  displayResponse = '-';

  constructor(private dsService: DsService){}

  handleClick() {
      	var data = {
    			value: parseFloat(this.requestValue)
    		};
    	this.dsService.dsInstance.rpc.make( 'multiply-number', data, ( err, resp ) => {
  
  			//display the response (or an error)
  			this.displayResponse = resp || err.toString();
  		});
  }
  
  ngOnInit() {
    this.dsService.dsInstance.rpc.provide( 'multiply-number', ( data, response ) => {
  		// respond to the request by multiplying the incoming number
  		// with the one from the response input
  		response.send( data.value * parseFloat(this.responseValue) );
    })
  }
}


/******************
 * App
 *****************/
@Component({
  selector: 'my-app',
  template: `
    <div class="group connectionState">
  		Connection-State is: <em id="connection-state">{{connectionState}}</em>
  	</div>
    <my-record></my-record>
    <my-events></my-events>
    <my-rpc></my-rpc>
  `
})
class AppComponent implements OnInit{
  connectionState = 'INITIAL';

  constructor(private dsService: DsService){
    console.log(dsService.dsInstance);
  }

  ngOnInit() {
    this.dsService.dsInstance.on( 'connectionStateChanged', ( connectionState ) => {
		  this.connectionState = connectionState;
    });
  }
}


@NgModule({
  declarations: [
    AppComponent,
    RecordComponent,
    EventsComponent,
    RPCComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    DsService
  ],
  bootstrap: [AppComponent]
})

class AppModule { }


platformBrowserDynamic().bootstrapModule(AppModule);
