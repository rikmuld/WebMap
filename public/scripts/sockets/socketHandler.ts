declare const io
declare const $

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()
    }
}