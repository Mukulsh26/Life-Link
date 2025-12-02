export default function RequestCard({
  request,
  onRespond,
  isDonor,
  isHospital,
  onViewResponders,
  onDelete,
  onChangeStatus,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md hover:shadow-xl hover:shadow-red-900/10 transition">
      
      <div className="flex justify-between items-start">
  <div>
    <h3 className="text-xl font-bold text-red-400">
      {request.bloodGroup}
    </h3>

    {/* URGENCY BADGE */}
    <span
      className={`text-xs px-2 py-1 rounded mt-1 inline-block
        ${
          request.urgency === "emergency"
            ? "bg-red-700 text-white animate-pulse"
            : ""
        }
        ${
          request.urgency === "high"
            ? "bg-red-500/40 text-red-300"
            : ""
        }
        ${
          request.urgency === "medium"
            ? "bg-yellow-500/30 text-yellow-300"
            : ""
        }
        ${
          request.urgency === "low"
            ? "bg-green-600/30 text-green-300"
            : ""
        }
      `}
    >
      {request.urgency === "emergency" && "⚠️ EMERGENCY NEED"}
      {request.urgency === "high" && "High Urgency"}
      {request.urgency === "medium" && "Medium Urgency"}
      {request.urgency === "low" && "Low Urgency"}
    </span>
  </div>

  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
    {request.status.toUpperCase()}
  </span>
</div>

      <p className="text-slate-300 text-sm mt-2">
        <span className="font-semibold text-red-300">Hospital:</span>{" "}
        {request.hospital?.hospitalName}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        City: {request.city}
      </p>

      {request.notes && (
        <p className="text-xs text-slate-500 mt-2 italic">
          {request.notes}
        </p>
      )}

      {/* DONOR BUTTON */}
      {isDonor && request.status === "active" && (
        <button
          onClick={onRespond}
          disabled={request.responded}
          className={`
            px-4 py-2 rounded-lg mt-4 w-full
            transition-all 
            ${request.responded
              ? "bg-green-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 active:scale-95"
            }
          `}
        >
          {request.responded ? "Response Submitted" : "I Want to Donate"}
        </button>
      )}

      {/* HOSPITAL ACTION BUTTONS */}
      {isHospital && (
        <div className="mt-4 flex gap-2">
          
          <button
            onClick={() => onViewResponders(request)}
            className="px-3 py-2 flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            {request.responders?.length || 0} Donor(s)
          </button>

          <button
            onClick={() => onChangeStatus(request._id, "cancelled")}
            className="px-3 py-2 flex-1 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition"
          >
            Inactive
          </button>

          <button
            onClick={() => onDelete(request._id)}
            className="px-3 py-2 flex-1 bg-red-700 hover:bg-red-800 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
