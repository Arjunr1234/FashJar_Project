function unlist(categoryId,clicked) {
  let confirmationMessage 
    if (clicked === 'Unlist') {
       confirmationMessage = "Are you sure you want to unlist this category?" 
    }else{
     confirmationMessage = "Are you sure you want to list this category?"
    }
        
swal({
    text: confirmationMessage ,
    buttons: ["cancel", true],
}).then((result) => {
    if (result) {
        $.ajax({
            url: `/admin/unlist?id=${categoryId}`,
            method: 'PATCH',
            contentType: 'application/json',
            success: function(data) {
                if (data.success) {
                if (clicked === 'Unlist') {
                 swal("Category Unlisted!", {
                    icon: "success",
                }).then(() => {
                    location.reload();
                });
            } else {
                swal("Category Listed!", {
                    icon: "success",
                }).then(() => {
                   
                    location.reload();
                });
            }
        } else {
            console.error('Unlisting failed');
        }
    },
            error: function(error) {
                
                swal("Oops!", "Failed to unlist the category. Please try again.", "error");
                console.error('AJAX error:', error);
            }
        });
    } else {
        // If the user cancels, do nothing
        // Optionally, you can display a message here 
    }
});
}


setTimeout(() => {
    const insertmessage = document.getElementById("insertmessage");
    insertmessage.style.display = "none";
}, 5000);

