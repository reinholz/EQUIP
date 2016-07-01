Template.subjectItem.events({
  'click .subject': function(e) {
   var envObj = Environments.find({_id:Router.current().params._envId}).fetch();
   var inputStyle = envObj[0]["inputStyle"];
   if (inputStyle == "box") {
     Session.set('subjId', this._id);
     $('#createSequenceBox').modal({
       keyboard: true,
       show: true
     });
   }
   if (inputStyle == "select") {
     $('#createSequenceSelect').modal({
       keyboard: true,
       show: true
     });
     Session.set('subjId', this._id);
     $('#createSequenceSelect').on('shown.bs.modal', function () {
        $('#wcdType').focus();
     })
   }
 }
});
//sequence ends in observatory.js
