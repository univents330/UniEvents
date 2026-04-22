export {
	useAttendee,
	useAttendees,
	useCreateAttendee,
	useDeleteAttendee,
	useUpdateAttendee,
} from "./hooks/use-attendees";
export type {
	AttendeeListQuery,
	AttendeeRecord,
} from "./services/attendees.service";
export { attendeesService } from "./services/attendees.service";
export { AttendeesView } from "./views/attendees-view";
