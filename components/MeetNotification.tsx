import Button from "./Button";
import MeetUserAvatar from "./MeetUserAvatar";
import { Notification, NotificationHandler } from "./Notification";
import { SimpleEventListener, SimpleEventListenerType } from "./simpleEventListener";

export class UserRequestNotification extends Notification<MeetNotificationHandler> {
    public readonly name: string;
    public readonly initials: string;
    public readonly onConfirm: (notif: Notification) => void;

    public constructor(handler: MeetNotificationHandler, name: string, initials: string, onConfirm: (notif: Notification) => void) {
        super(handler)
        this.name = name;
        this.initials = initials;
        this.onConfirm = onConfirm;
    }
    public build(): JSX.Element {
        return (
            <div ref={this.ref} className="p-5 bg-gray-600 shadow-lg rounded-lg inline-flex flex-col items-center gap-5 max-w-[350px]">
                <div className="text-white flex flex-row gap-2">
                    <MeetUserAvatar className="bg-white inline" textColor="gray-600" initials={this.initials}/>
                    <p className="inline">
                        <b>{this.name}</b> would like to join your room
                    </p>
                </div>
                <div className="flex flex-row flex justify-center gap-5">
                    <Button onClick={() => { this.onConfirm(this); this.hide() }} className="bg-green-400 text-white">Accept</Button>
                    <Button onClick={() => this.hide()} className="bg-red-400 text-white">Decline</Button>
                </div>
            </div>
        )
    }
}

export class MeetNotificationHandler extends NotificationHandler {

    public showUserRequestNotification(name: string, initials: string,  onConfirm: (notif: Notification) => void) {
        return this.showNotification(new UserRequestNotification(this, name, initials, onConfirm))
    }
}