package com.example.bipolnavbar

import android.content.Context
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ListView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.launch
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import okhttp3.OkHttpClient
import okhttp3.Interceptor
import okhttp3.Request

private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

class Announcement : Fragment() {

    private lateinit var announcementService: AnnouncementService
    private lateinit var listView: ListView
    private lateinit var adapter: AnnouncementAdapter
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            // Handle any arguments here if needed
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_announcement, container, false)
        listView = view.findViewById(R.id.listView)
        progressBar = view.findViewById(R.id.progressBar)
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Initialize Retrofit Service
        announcementService = AnnouncementService.create()

        // Fetch data from API using coroutine
        lifecycleScope.launch {
            try {
                progressBar.visibility = View.VISIBLE
                val response = announcementService.getAnnouncements()

                if (response.isSuccessful) {
                    val announcements = response.body()?.data ?: emptyList()

                    // Use AnnouncementAdapter with List<AnnouncementItem>
                    adapter = AnnouncementAdapter(requireContext(), announcements)
                    listView.adapter = adapter
                } else {
                    Toast.makeText(requireContext(), "Failed to fetch data", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
//                Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }

    companion object {
        @JvmStatic
        fun newInstance(param1: String, param2: String) =
            Announcement().apply {
                arguments = Bundle().apply {
                    putString(ARG_PARAM1, param1)
                    putString(ARG_PARAM2, param2)
                }
            }
    }
}

data class AnnouncementItem(
    @SerializedName("created_by") val createdBy: String,
    val id: Int,
    val message: String,
    val time: String
)

class AnnouncementAdapter(private val context: Context, private val data: List<AnnouncementItem>) : ArrayAdapter<AnnouncementItem>(context, 0, data) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        var itemView = convertView
        val viewHolder: ViewHolder

        if (itemView == null) {
            itemView = LayoutInflater.from(context).inflate(R.layout.fragment_announcement, parent, false)
            viewHolder = ViewHolder()
            viewHolder.createdByTextView = itemView.findViewById(R.id.createdByTextView)
            viewHolder.messageTextView = itemView.findViewById(R.id.messageTextView)
            viewHolder.timeTextView = itemView.findViewById(R.id.timeTextView)
            itemView.tag = viewHolder
        } else {
            viewHolder = itemView.tag as ViewHolder
        }

        val currentItem = data[position]

        viewHolder.createdByTextView.text = "Posted by: ${currentItem.createdBy}"
        viewHolder.messageTextView.text = currentItem.message
        viewHolder.timeTextView.text = currentItem.time

        return itemView!!
    }

    private class ViewHolder {
        lateinit var createdByTextView: TextView
        lateinit var messageTextView: TextView
        lateinit var timeTextView: TextView
    }
}

data class AnnouncementResponse(
    val data: List<AnnouncementItem>,
    val message: String,
    val statusCode: Int
)

interface AnnouncementService {

    @GET("announcement")
    suspend fun getAnnouncements(): Response<AnnouncementResponse>

    companion object {
        private const val BASE_URL = "http://72.61.141.118:3000/api/"

        fun create(): AnnouncementService {
            val client = OkHttpClient.Builder()
                .addInterceptor { chain ->
                    val request: Request = chain.request().newBuilder()
                        .header("Authorization", "cff2f609d3accf61df924590eac88bc2e5107eb3df47af97576f3ab6139e59bc")
                        .build()
                    chain.proceed(request)
                }
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            return retrofit.create(AnnouncementService::class.java)
        }
    }
}
