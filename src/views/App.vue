<template>
	<router-view/>
</template>

<script>

export default {
	name: 'App',
	components: {},
	setup() {
		return {}
	}
}
</script>

<style>
@font-face {
	font-family: "Biysk";
	src: url("~@/fonts/Biysk.ttf") format("truetype");
	font-display: swap;
}

span {
	user-select: none;
}

html {

}

body {
	position: relative;
	margin: 0;
	padding: 0;
	height: 100%;
	overflow: hidden;
	background-color: black;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #748da9;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}

.fade-enter,
.fade-leave-to {
	visibility: hidden;
	opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
	transition: all 0.5s;
}

</style>
