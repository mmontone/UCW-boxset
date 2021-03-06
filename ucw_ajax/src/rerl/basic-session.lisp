;; -*- lisp -*-

(in-package :it.bese.ucw)

(defmethod session.value (key (session basic-session) &optional default)
  "Lookup the value associated with KEY in the session."
  (gethash key (session.object-pool session) default))

(defmethod (setf session.value) (value key (session basic-session))
  (setf (gethash key (session.object-pool session)) value))

(defmethod expiredp ((session basic-session))
  "Returns T if SESSION's last-access is more than
*default-session-longevity* seconds ago."
  (< (session.last-access session)
     (- (get-universal-time) *default-session-longevity*)))

(defmethod expire-session ((session basic-session))
  nil)

(defmethod make-new-frame (action (session basic-session))
  "Inserts a new frame in the frame stack of SESSION. Returns
  the new frame. This new frame will have the same component and
  backtracks as the current frame in SESSION. Sets session's
  current-frame to the newly created frame."
  (let* ((id (loop
                for id = (random-string +frame-id-length+)
                while (gethash id (frame-id-hash (session.frames session)))
                finally (return (strcat "_" id))))
         (new-frame (make-next-frame (session.current-frame session) id)))
    (enqueue (session.frames session) new-frame)
    (setf (session.current-frame session) new-frame)
    (ucw.rerl.session.dribble "Created new frame ~S." new-frame)
    new-frame))

(defconstant +epoch-start+ (encode-universal-time 0 0 0 1 1 1970))

(defclass frame-queue (lru-queue)
  ((frame-id-hash :accessor frame-id-hash
                  :initform (make-hash-table :test 'equal)))
  (:documentation "A LRU queue with a hash table wrapped around
  it for fast 'contains' checks."))

(defmethod dequeue :around ((queue frame-queue) &optional default-value)
  (declare (ignore default-value))
  (let ((frame (call-next-method)))
    (when frame
      (remhash (frame.id frame) (frame-id-hash queue))
      ;; remove the frames own backtracks form the set of live backtracks
      (let ((live-backtracks (live-backtracks-of (context.session *context*))))
        (iter (for place :in-vector (allocated-backtracks-of frame))
              (remhash place live-backtracks))))
    frame))

(defmethod enqueue :after ((queue frame-queue) frame)
  (setf (gethash (frame.id frame) (frame-id-hash queue)) frame))

(defmethod find-frame-by-id ((queue frame-queue) (frame-id string))
  (gethash frame-id (frame-id-hash queue)))

(defmethod find-frame-by-id ((session basic-session) (frame-id string))
  (find-frame-by-id (session.frames session) frame-id))

(defmethod find-frame-by-id ((session basic-session) (frame-id null))
  nil)

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
