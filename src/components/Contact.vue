<template>
  <div class="container-contact">
    <div id="contact-form" class="contact-form">
      <h1 class="contact-form_title">Contact Form</h1>
      <div class="separator"></div>

      <div v-if="isSending" class="loading">Sendig...</div>

      <form class="form" @submit="onSubmit">
        <input required name="name" v-model='name' placeholder="Name" type="text" autocomplete="off">
        <input required name="email" v-model="email" placeholder="E-mail" type="email" autocomplete="off">
        <textarea name="message" v-model="message" rows="4" placeholder="Message"></textarea>
        <button class="button">Send</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Contact',
  setup(){
    let name      = ref('');
    let email     = ref('');
    let message   = ref('');
    let isSending = ref(false);

    function clearForm() {
      name.value    = ''
      email.value   = ''
      message.value = ''
    }

    function onSubmit(evt) {
      evt.preventDefault();

      isSending = true;

      setTimeout(() => {
        // Build for data
        let form = new FormData();
        form.append('name', name.value);
        form.append('email', email.value);
        form.append('message', message.value);

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.value, email:email.value, message:message.value })
        };
        // Send form to server
        //fetch("https://jsonplaceholder.typicode.com/posts", requestOptions)
        fetch("http://127.0.0.1:27017/", requestOptions)
            .then(response => response.json())
            .then(function(data){
              console.log(data);
              clearForm();
            });

      /*
        $http.post('/app.php', form).then((response) => {
          console.log(response);
          clearForm();
          isSending.value = false;
        }).catch((e) => {
          console.log(e)
        });
*/
      }, 1000);
    }


    return {
      name,
      email,
      message,
      isSending,
      onSubmit
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.container-contact {
  position:absolute;
  height:50%;
  width:500px;
  text-align: left;
  display:flex;
  justify-content: center;
  flex-direction: column;
  border:0px solid white;
  background-color: #111111;
  right:0;
  bottom:0;
  border-top-left-radius: 30px;
  transition: height 0.5s ease;
}

.contact-form {
  font-family: 16px;
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
}

.contact-form .separator {
  border-bottom: solid 1px #ccc;
  margin-bottom: 15px;
}

.contact-form .form {
  display: flex;
  flex-direction: column;
  font-size: 16px;
}

.contact-form_title {
  color: #333;
  text-align: left;
  font-size: 28px;
}

.contact-form input[type="email"],
.contact-form input[type="text"],
.contact-form textarea {
  border: solid 1px #e8e8e8;
  font-family: 'Roboto', sans-serif;
  padding: 10px 7px;
  margin-bottom: 15px;
  outline: none;
}

.contact-form textarea {
  resize: none;
}

.contact-form .button {
  background: #da552f;
  border: solid 1px #da552f;
  color: white;
  cursor: pointer;
  padding: 10px 50px;
  text-align: center;
  text-transform: uppercase;
}

.contact-form .button:hover {
  background: #ea532a;
  border: solid 1px #ea532a;
}

.contact-form input[type="email"],
.contact-form input[type="text"],
.contact-form textarea,
.contact-form .button {
  font-size: 15px;
  border-radius: 3px
}


</style>
