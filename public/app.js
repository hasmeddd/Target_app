function save_event() {
    var eventName = $('#event_name').val();
    var eventStart = $('#event_start_date').val();
    var eventEnd = $('#event_end_date').val();
    var eventDetails = $('#event_details').val();

    if (!eventName || !eventStart || !eventEnd ) {
        alert("Vui lòng điền đầy đủ thông tin cho sự kiện!");
        return;
    }


    var eventData = {
        title: eventName,
        start: eventStart,
        end: eventEnd,
        details: eventDetails,
        status: false,
        more: []
    };

    $.ajax({
        type: 'POST',
        url: '/addEvent',
        data: eventData,
        success: function(response) {
            alert(response); // Hiển thị thông báo thành công từ máy chủ
            calendar.refetchEvents();
            // Xóa dữ liệu từ form
            $('#event_name').val('');
            $('#event_start_date').val('');
            $('#event_start_time').val('');
            $('#event_end_date').val('');
            $('#event_end_time').val('');
            $('#event_details').val('');
            // Đóng modal
            $('#event_entry_modal').modal('hide');
        },
        error: function(xhr, status, error) {
            console.error("Lỗi khi tạo sự kiện:", error);
            alert("Đã xảy ra lỗi khi tạo sự kiện!");
        }
    });
}
// show modal add_event
$(document).ready(function() {
    $('#add-event-btn').click(function() {
        $('#event_entry_modal').modal('show');
    });
});
function update_event() {
    var updatedEventName = $('#update_event_name').val();
    var updatedEventStartDate = $('#update_event_start_date').val();
    var updatedEventStartTime = $('#update_event_start_time').val();
    var updatedEventEndDate = $('#update_event_end_date').val();
    var updatedEventEndTime = $('#update_event_end_time').val();
    var updatedEventDetails = $('#update_event_details').val();
    var updatedEventStatus = $('#update_event_status').val(); 

    // Kiểm tra xem tất cả các trường đã được điền đầy đủ không
    if (!updatedEventName || !updatedEventStartDate || !updatedEventStartTime || !updatedEventEndDate || !updatedEventEndTime) {
        alert("Please fill in all fields for the updated event!");
        return;
    }

    // Tạo đối tượng dữ liệu sự kiện cập nhật
    var updatedEventData = {
        title: updatedEventName,
        start: updatedEventStartDate + 'T' + updatedEventStartTime,
        end: updatedEventEndDate + 'T' + updatedEventEndTime,
        details: updatedEventDetails,
        status: updatedEventStatus, // Sử dụng giá trị trạng thái từ dropdown
        more: []
    };
    // Gửi yêu cầu cập nhật sự kiện đến máy chủ
    $.ajax({
        type: 'POST',
        url: '/update/' + updatedEventId, // Thay đổi đường dẫn này nếu cần
        data: updatedEventData,
        success: function(response) {
            alert(response); // Hiển thị thông báo thành công từ máy chủ
            calendar.refetchEvents();
            $('#update_event_modal').modal('hide');
        },
        error: function(xhr, status, error) {
            console.error("Error updating event:", error);
            alert("An error occurred while updating the event!");
        }
    });
}


function delete_event() {
    if (confirm("Are you sure you want to delete this event?")) {
        $.ajax({
            type: 'POST',
            url: '/delete/' + updatedEventId, // Đường dẫn để xóa sự kiện, hãy đảm bảo nó phù hợp với route của bạn
            success: function(response) {
                // alert(response); // Hiển thị thông báo thành công từ máy chủ
                calendar.refetchEvents(); // Làm mới lịch để cập nhật sự kiện bị xóa
                $('#update_event_modal').modal('hide'); // Đóng modal sau khi xóa
            },
            error: function(xhr, status, error) {
                console.error("Error deleting event:", error);
                alert("An error occurred while deleting the event!");
            }
        });
    }
}   

function checkEmail(email) {
    var regex = /^(?=.*[0-9])(?=.*[a-zA-Z]).*@gmail\.com$/;
    var email_message = document.getElementById("email_message");

    if (regex.test(email)) {
        email_message.innerHTML = "Email hợp lệ.";
        email_message.classList.remove("error_message");
        email_message.classList.add("valid_message");
        return true;
    } else if (email == "") {
        email_message.innerHTML = "";
        return true;
    } else {
        email_message.innerHTML = "Email phải chứa ít nhất một số, một chữ cái, và kết thúc bằng @gmail.com";
        email_message.classList.remove("valid_message");
        email_message.classList.add("error_message");
        return false;
    }
}
function checkPassword(password) {
    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    var password_message = document.getElementById("password_message");
    
    if (regex.test(password)) {
        password_message.innerHTML = "Password ok!";
        password_message.classList.remove("error_message");
        password_message.classList.add("valid_message");
      return true;
    }else if(password == ""){
      password_message.innerHTML = "";
      return true;
    } else {
      password_message.innerHTML =
        "Password phải có ít nhất một chữ cái in hoa, ít nhất một số, ít nhất một chữ cái thường, và có ít nhất tám ký tự";
      return false;
    }
}
