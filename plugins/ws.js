export default ({ app }, inject) => {
    var initialized = false;
    var wsc = null;
    function waitForConnection(callback, interval) {
        if (wsc === null) {
            return;
        }
        if (wsc.readyState === 1) {
            callback();
        } else {
            setTimeout(function () {
                waitForConnection(callback, interval);
            }, interval);
        }
    }
    function connect() {
        console.log("connecting to ws server...");
        wsc = new WebSocket(process.env.WS_BASE_URL);
        wsc.onmessage = (msgEvent) => {
            // console.log(incomingMessage)
            // console.log("got ws message from server: " + msgEvent.data);
            const jd = JSON.parse(msgEvent.data);
            if (jd != null && jd.status != "failed") {
                if (jd.type == "stats") {
                    $nuxt.$root.$emit("stats-update", jd);
                } else if (jd.type == "updates") {
                    $nuxt.$root.$emit(jd.type + "." + jd.tag, jd);
                } else {
                    $nuxt.$root.$emit(jd.type + "." + jd.id, jd);
                }
            }
        };
        wsc.onopen = (event) => {
            console.log("connected.")
            $nuxt.$root.$emit("connection.connected");
        }
        wsc.onclose = (e) => {
            console.log('Connection lost, reconnecting in 1 seconds', e.reason);
            $nuxt.$root.$emit("connection.lost");
            setTimeout(connect, 1000);
        };
        // waitForConnection(() => wsc.send(JSON.stringify({ "action": "info", "id": "currentUserInfo", "payload": "whoami" })), 1000);
    }
    function initialize() {
        if (!initialized) {
            connect();
            initialized = true;
        }
    }
    function send(data) {
        if (wsc === null) {
            initialize();
        }
        waitForConnection(() => wsc.send(JSON.stringify(data)), 1000);
    }
    inject('ws', {
        send,
        queryGraph(query, id) {
            send({
                action: "graphql",
                id,
                payload: { query, operation_name: null, variables: null }
            })
        },
        close() {
            // reset connection
            initialized = false;
            if (wsc != null) {
                wsc.close();
                wsc = null;
            }
        }
    });
}
