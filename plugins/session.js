export default async({app}, inject) => {
    inject('session', {
        currentUser(){
            return app.$storage.getUniversal("currentUser");
        },
        setCurrentUser(acc){
            app.$storage.setUniversal("currentUser", acc);
        }
    })
}
