/**
* SHOUTOUT backend service
* 
* @spartacusrex
*/

//Load js libs
MDS.load("puresha1.js");
MDS.load("sql.js");
MDS.load("txn.js");

//Main Shoutout Address
var SHOUTOUT_ADDRESS = "0x73686F75746F7574"

//Are we logging data
var logs = false;

function stripBrackets(coinstr){
	
	var str = coinstr.trim();
	if(str.startsWith("[")){
		str = str.substring(1);
	}
	
	if(str.endsWith("]")){
		str = str.substring(0,str.length-1);
	}
	
	return str;
}


//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
		
		//Init the DB		
		createDB(function(){
	
			//Try to insert a message
			insertMessage("minima", "Start Here!", "Shout Out!", "0x00", "Blah Blah Blah!", 0, function(res){});
			
			//Notify of new messages..
			MDS.cmd("coinnotify action:add address:"+SHOUTOUT_ADDRESS,function(startup){});
	
			MDS.log("Service Inited")
		});
	
	}else if(msg.event == "NOTIFYCOIN"){
			
		//Is it the one that matters
		if(msg.data.address ==  SHOUTOUT_ADDRESS){
			//MDS.log("NEW SHOUTOUT : "+JSON.stringify(msg.data))
			
			//Check is Valid..
			//..
			
			//Add to the DB..
			var msg_category = stripBrackets(msg.data.coin.state[0]);
			if(msg_category.indexOf(" ") != -1){
				//ERROR
				MDS.log("Category Invalid : "+msg_category);
				return;
			}
			
			var msg_title 	 = stripBrackets(msg.data.coin.state[1]);
			var msg_message  = stripBrackets(msg.data.coin.state[2]);
			var msg_user 	 = stripBrackets(msg.data.coin.state[3]);
			var msg_randid 	 = stripBrackets(msg.data.coin.state[4]);
			var msg_pubkey 	 = stripBrackets(msg.data.coin.state[5]);
			var msg_sign 	 = stripBrackets(msg.data.coin.state[6]);
			
			//Check the signature..
			checkMessageSig(msg_category, msg_title, msg_message, 
						msg_user, msg_pubkey, msg_randid, msg_sign, function(valid){
							
				if(!valid){
					MDS.log("Invalid signature for "+msg_user+" "+msg_pubkey);
				}else{
					//Insert unread message - if not already added
					insertMessage(msg_category, msg_title, msg_user, msg_pubkey, msg_message, msg_randid, 0, function(inserted){
						//Do we notify the User
						if(inserted){
							var cattitleid = getCategoryTitleID(msg_category, msg_title);
							isNotify(cattitleid,function(notify){
								if(notify){
									var notmsg = msg_user+" : "+msg_message;
									if(notmsg.length>30){
										notmsg = notmsg.substring(0,30)+"..";
									}
									MDS.notify(notmsg);		
								}
							});
						}	
					});					
				}
			});
		}
	}
});		
