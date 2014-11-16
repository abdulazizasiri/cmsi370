$(function() {

    window.onload = $.getJSON(
        "http://lmu-diabolical.appspot.com/characters",
        function (characters) {
            $("tbody").append(characters.map(function (character) {
                var filledInTemplate = fillInCharacterInfo('.character-template', character);

                filledInTemplate.find(".edit").bind("click", function(){
                    showEditCharacterModal(character);
                });

                filledInTemplate.find(".delete").bind("click", function(){
                    showDeleteCharacterModal(character);
                });
                return filledInTemplate;
            }));
        }
    );

    $(".createCharacter").bind("click", function(){
        showCreateCharacterModal();
    })

    var showCreateCharacterModal = function(character) {
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_INFO,
            title: 'Create a New Character ',
            message: $(".new-character-template"),
            buttons: [
            {
                label: 'Change Character',
                cssClass: 'btn-warning',
                action: function(dialogueItself){
                    changeCharacter({
                        character: character,
                        nameInput: $(template).find("#name-change").val(),
                        classInput: $(template).find("#class-change").val(),
                        genderInput: $(template).find("#gender-change").val(),
                        levelInput: $(template).find("#level-change").val()
                    }, dialogueItself);
                }
            },
            {
                label: 'Cancel',
                cssClass: 'btn-danger',
                action: function(dialogueItself){
                    dialogueItself.close();
                }
            }]
        })
    };

    var showDeleteCharacterModal = function(character) {
        $('#deleteModal').find('.modal-message').text("Are you sure you want to delete " + character.name + "?");
        $('#deleteModal').modal('show');
        var deleteCharBtn = $('#deleteModal').find('.delete-character');
        $(deleteCharBtn).bind('click', function(){
          $(deleteCharBtn).button('loading');
          setTimeout(function () {
            $(deleteCharBtn).button('reset');
            $(deleteCharBtn).text('Try Again?');
          }, 5000);
          deleteCharacter(character);
        })



        // BootstrapDialog.show({
        //     message: 'Are you sure you want to delete this character?',
        //     buttons: [{
        //         type: BootstrapDialog.TYPE_DANGER,
        //         icon: 'glyphicon glyphicon-remove',
        //         label: 'Delete',
        //         cssClass: 'btn-danger',
        //         autospin: true,
        //         action: function(dialogRef){
        //             dialogRef.getModalBody().html('Deleting...');
        //             $.ajax({
        //                 type: 'DELETE',
        //                 url: "http://lmu-diabolical.appspot.com/characters/" + character.id,
        //                 success: function (data, textStatus, jqXHR) {
        //                     dialogRef.close();
        //                     BootstrapDialog.show({
        //                         type: BootstrapDialog.TYPE_SUCCESS,
        //                         title: "Success!",
        //                         message: "Successfully deleted the character."
        //                     })
        //                 }
        //             })

        //             setTimeout(function(){
        //                 dialogRef.close();
        //             }, 3000);
        //         }
        //         },
        //         {
        //             label: 'Close',
        //             action: function(dialogRef){
        //             dialogRef.close();
        //         }
        //     }]
        // });
    }

    var deleteCharacter = function(character) {
        $.ajax({
            type: 'DELETE',
            url: "http://lmu-diabolical.appspot.com/characters/" + character.id,
            success: function (data, textStatus, jqXHR) {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    title: "Success!",
                    message: "Successfully deleted the character."
                })
            }
        })
    }

    var showEditCharacterModal = function(character) {
        var editCharacterModal = fillInCharacterInfo('#editCharacterModalTemplate', character);
        $(editCharacterModal).find('.modal-title').html('<h2>Edit ' + character.name + '</h2>');
        $(editCharacterModal).modal('show');

        $(editCharacterModal).find('.edit-character').bind("click", function(){
            $(editCharacterModal).modal('hide');
            var updatedCharacter = {
                id: character.id,
                name: $(editCharacterModal).find("#name-change").val() || character.name,
                classType: $(editCharacterModal).find("#class-change").val() || character.classType,
                gender: $(editCharacterModal).find("#gender-change").val() || character.gender,
                level: $(editCharacterModal).find("#level-change").val() || character.level
            }
            editCharacter(character, updatedCharacter);
            console.log("updatedCharacter " + JSON.stringify(updatedCharacter));
        });

    }

    var editCharacter = function(character, updatedCharacter){
        $('#editModal').modal('show');
        editButton = $('#editModal').find('.edit-character');
        editButton.bind("click", function(){
          $(editButton).button('loading');
          setTimeout(function () {
            $(editButton).button('reset');
            $(editButton).text('Try Again?');
          }, 5000);
          sendCharacterUpdates(character, updatedCharacter);
        });
    }


    var sendCharacterUpdates = function(oldCharacter, updatedCharacter){
        $.ajax({
            type: 'PUT',
            url: "http://lmu-diabolical.appspot.com/characters/" + updatedCharacter.id,
            data: JSON.stringify(updatedCharacter),
            contentType: "application/json",
            dataType: "json",
            accept: "application/json",
            success: function (data, textStatus, jqXHR) {
                updateTableWithEdits(oldCharacter, updatedCharacter);
                console.log("oldCharacter " + JSON.stringify(oldCharacter));
                oldCharacter.name = updatedCharacter.name;
                oldCharacter.gender = updatedCharacter.gender;
                oldCharacter.classType = updatedCharacter.classType;
                oldCharacter.level = updatedCharacter.level;
                $('#editModal').modal('hide');
                $('#successEditModal').modal('show');
            }
        });
    }

    var updateTableWithEdits = function (oldCharacter, updatedCharacter){
        var characterId = '#' + oldCharacter.id;
        $(characterId).find('.name').html(updatedCharacter.name);
        $(characterId).find('.class').html(updatedCharacter.class);
        $(characterId).find('.gender').html(updatedCharacter.gender);
        $(characterId).find('.level').html(updatedCharacter.level);
    }

    var fillInCharacterInfo = function(template, character) {
        var filledInTemplate = $(template).clone();
        var characterImageSrc = "<img src=./" + character.gender + ".ico>";
        filledInTemplate.attr("id", character.id);
        filledInTemplate.find(".image").replaceWith(characterImageSrc);
        filledInTemplate.find(".name").text(character.name);
        filledInTemplate.find(".class").text(character.classType);
        filledInTemplate.find(".gender").text(character.gender.toLowerCase());
        filledInTemplate.find(".level").text(character.level);
        return filledInTemplate;
    }
});