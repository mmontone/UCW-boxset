;;;; $Id: package.lisp 274 2007-06-24 18:52:30Z ehuelsmann $
;;;; $URL: svn://common-lisp.net/project/usocket/svn/usocket/trunk/package.lisp $

;;;; See the LICENSE file for licensing information.

#+lispworks (cl:require "comm")

(cl:eval-when (:execute :load-toplevel :compile-toplevel)
  (cl:defpackage :usocket
      (:use :cl)
    (:export #:*wildcard-host*
             #:*auto-port*

             #:socket-connect ; socket constructors and methods
             #:socket-listen
             #:socket-accept
             #:socket-close
             #:wait-for-input
             #:get-local-address
             #:get-peer-address
             #:get-local-port
             #:get-peer-port
             #:get-local-name
             #:get-peer-name

             #:with-connected-socket ; convenience macros
             #:with-server-socket
             #:with-client-socket
             #:with-socket-listener

             #:usocket ; socket object and accessors
             #:stream-usocket
             #:stream-server-usocket
             #:socket
             #:socket-stream

             #:host-byte-order ; IP(v4) utility functions
             #:hbo-to-dotted-quad
             #:hbo-to-vector-quad
             #:vector-quad-to-dotted-quad
             #:dotted-quad-to-vector-quad
             #:ip=
             #:ip/=

             #:socket-condition ; conditions
             #:ns-condition
             #:socket-error ; errors
             #:ns-error
             #:unknown-condition
             #:ns-unknown-condition
             #:unknown-error
             #:ns-unknown-error)))

