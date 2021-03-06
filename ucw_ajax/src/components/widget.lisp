;; -*- lisp -*-

(in-package :it.bese.ucw)

(enable-bracket-syntax)

;;;; ** Widget

(defcomponent widget-component (ajax-component-mixin)
  ()
  (:documentation "A widget which should be wrapped in a <div>."))

(defcomponent widget-component-with-body (widget-component
                                          component-body-mixin)
  ())

(defcomponent inline-widget-component (ajax-component-mixin)
  ()
  (:documentation "A widget which should be wrapped in a <span>"))

(defcomponent inline-widget-component-with-body (inline-widget-component
                                                 component-body-mixin)
  ())

(defmethod render :wrap-around ((widget widget-component))
  (render-widget-wrapper widget #'call-next-method))

(defgeneric render-widget-wrapper (widget next-render-method)
  (:documentation "This is an internal method to make it possible for dojo-widget
to wrap the rendered output even though widget has a :wrap-around defined."))

(defmethod render-widget-wrapper ((self widget-component) next-render-method)
  "Wrap WIDGET in a <div> tag."
  (with-html-element-wrapper self <:div
    (funcall next-render-method self)))

(defmethod render-widget-wrapper ((self inline-widget-component) next-render-method)
  "Wrap widget in a <span> tag."
  (with-html-element-wrapper self <:span
    (funcall next-render-method self)))

;; Copyright (c) 2003-2005 Edward Marco Baringer
;; All rights reserved. 
;; 
;; Redistribution and use in source and binary forms, with or without
;; modification, are permitted provided that the following conditions are
;; met:
;; 
;;  - Redistributions of source code must retain the above copyright
;;    notice, this list of conditions and the following disclaimer.
;; 
;;  - Redistributions in binary form must reproduce the above copyright
;;    notice, this list of conditions and the following disclaimer in the
;;    documentation and/or other materials provided with the distribution.
;; 
;;  - Neither the name of Edward Marco Baringer, nor BESE, nor the names
;;    of its contributors may be used to endorse or promote products
;;    derived from this software without specific prior written permission.
;; 
;; THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
;; "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
;; LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
;; A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT
;; OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
;; SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
;; LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
;; DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
;; THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
;; (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
;; OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
