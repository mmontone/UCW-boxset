;;;; -*- lisp -*-

(in-package :it.bese.ucw-user)

(defentry-point "address.ucw" (:application *example-application*) ()
  (call 'show-address :address (call 'get-address)))

(defclass address ()
  ((name :accessor name :initarg :name :initform "")
   (email :accessor email :initarg :email :initform "")))

(defcomponent address-manipulator-mixin ()
  ((address :accessor address :initarg :address :backtrack t
            :initform (make-instance 'address))))

(defcomponent show-address (standard-window-component address-manipulator-mixin)
  ())

(defmethod render-html-body ((s show-address))
  (<:p "Your address:")
  (<:table
    (<:tr (<:td "Name:") (<:td (<:as-html (name (address s)))))
    (<:tr (<:td "Email:") (<:td (<:as-html (email (address s)))))))

(defcomponent get-address (standard-window-component address-manipulator-mixin)
  ((message :accessor message :initarg :message :initform nil)))

(defmethod render-html-body ((g get-address))
  (<:p "Please submit an address:")
  (when (message g)
    (<:p :style "color: #ff0000; font-weight: bold"
      (<:as-html (message g))))
  (<ucw:form :action-body (print-info g)
    (<:table 
      (<:tr (<:td "Name:") (<:td (<ucw:text :accessor (name (address g)))))
      (<:tr (<:td "Email:") (<:td (<ucw:text :accessor (email (address g)))))
      (<:td (<:td :colspan 2 :align "center"
              (<:input :type "submit"))))))

(defmethod/cc print-info ((self get-address))
  (if (and (name (address self))  (string/= "" (name (address self)))
           (email (address self)) (string/= "" (email (address self))))
      (answer (make-instance 'address :name (name (address self)) :email (email (address self))))
      (setf (message self) "Sorry, you must supply both a name and an email.")))
